import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v2 as cloudinary } from 'cloudinary';
import {
  Category,
  PaymentMethod,
  Receipt,
  AiProcessingLog,
} from '@/database/entities';
import {
  AiLogType,
  ReceiptProcessingStatus,
} from '@/common/enums';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
    @InjectRepository(AiProcessingLog)
    private aiLogRepository: Repository<AiProcessingLog>,
  ) {
    const apiKey = this.configService.get<string>('services.googleAiApiKey');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }

    const cloudName = this.configService.get<string>('services.cloudinary.cloudName');
    const cloudApiKey = this.configService.get<string>('services.cloudinary.apiKey');
    const cloudApiSecret = this.configService.get<string>('services.cloudinary.apiSecret');
    if (cloudName && cloudApiKey && cloudApiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: cloudApiKey,
        api_secret: cloudApiSecret,
      });
    }
  }

  private async parseWithGroq(prompt: string): Promise<any> {
    const groqApiKey = this.configService.get<string>('services.groqApiKey');
    if (!groqApiKey) return null;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert bilingual financial reasoning AI that meticulously extracts every single expense from user speech or text into strict JSON format.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API responded with status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from Groq API');
    return JSON.parse(content);
  }

  async parseVoice(userId: string, text: string, language = 'bn') {
    const startTime = Date.now();
    const categories = await this.categoryRepository.find({
      where: { isEnabled: true },
      relations: ['subcategories'],
    });
    const paymentMethods = await this.paymentMethodRepository.find({
      where: { isEnabled: true },
    });

    const categoryContext = categories.map((c) => ({
      id: c.id,
      name: c.name,
      nameBn: c.nameBn,
      subcategories: c.subcategories.map((s) => ({
        id: s.id,
        name: s.name,
        nameBn: s.nameBn,
      })),
    }));

    const paymentMethodContext = paymentMethods.map((p) => ({
      id: p.id,
      name: p.name,
      nameBn: p.nameBn,
    }));

    const prompt = `
You are an intelligent bilingual (English and Bangla) AI expense parser for an expense tracker called Khoroch.
Analyze the following user input text. 

CRITICAL RULE FOR MULTIPLE EXPENSES:
- The user may describe ONE or MULTIPLE expenses in a single utterance (e.g. "Dinner 500 and coffee 120 using bkash", "বাজার ১০০০ টাকা আর রিকশা ৫০ টাকা", "Bought groceries 450, medicine 200, fuel 300, paid with card").
- You MUST extract EVERY discrete expense as an individual separate object inside the "expenses" array!
- Do NOT merge, sum, or combine multiple expenses into one item under any circumstance.
- Note: No description field is required for each expense.

Input Text: "${text}"
Current Date: "${new Date().toISOString().split('T')[0]}"

Available Categories: ${JSON.stringify(categoryContext)}
Available Payment Methods: ${JSON.stringify(paymentMethodContext)}

Tasks:
1. Identify all discrete expenses mentioned.
2. For each expense, extract:
   - "amount" (number, positive float)
   - "currency" (always "BDT" unless specified otherwise)
   - "merchant" (merchant or vendor name if mentioned, otherwise null)
   - "expenseDate" (YYYY-MM-DD format, relative to Current Date if mentioned like today/yesterday)
   - "categoryId" (the best matching category ID from the list, or null)
   - "categoryName" (the matched category English name)
   - "subcategoryId" (best matching subcategory ID from that category if applicable, or null)
   - "subcategoryName" (matched subcategory English name, or null)
   - "paymentMethodId" (best matching payment method ID, or null)
   - "paymentMethodName" (matched payment method name, or null)
3. Detect the primary language ("bn", "en", or "bilingual").
4. Rate overall confidence (0.00 to 1.00).

Return ONLY valid JSON matching this exact structure:
{
  "detectedLanguage": "bn",
  "confidence": 0.95,
  "expenses": [
    {
      "amount": 50,
      "currency": "BDT",
      "merchant": null,
      "expenseDate": "2026-08-17",
      "categoryId": "...",
      "categoryName": "Transportation",
      "subcategoryId": null,
      "subcategoryName": null,
      "paymentMethodId": "...",
      "paymentMethodName": "Cash"
    }
  ]
}
`;

    let parsedResult: any = {
      detectedLanguage: language,
      confidence: 0.8,
      expenses: [],
    };

    try {
      // 1. Prioritize Groq with Llama-3.3-70B for exceptional reasoning and multiple expense extraction
      const groqApiKey = this.configService.get<string>('services.groqApiKey');
      if (groqApiKey) {
        parsedResult = await this.parseWithGroq(prompt);
      } else if (this.genAI) {
        const model = this.genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });
        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        parsedResult = JSON.parse(textResponse);
      } else {
        parsedResult = this.heuristicVoiceParser(text, categories, paymentMethods);
      }
    } catch (error) {
      this.logger.error(`AI Voice Parsing failed with primary provider: ${error.message}`);
      // Fallback to Gemini if Groq fails, or heuristic
      try {
        if (this.genAI) {
          const model = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { responseMimeType: 'application/json' },
          });
          const result = await model.generateContent(prompt);
          parsedResult = JSON.parse(result.response.text());
        } else {
          parsedResult = this.heuristicVoiceParser(text, categories, paymentMethods);
        }
      } catch (fallbackError) {
        this.logger.error(`Fallback parser failed: ${fallbackError.message}`);
        parsedResult = this.heuristicVoiceParser(text, categories, paymentMethods);
      }
    }

    const duration = Date.now() - startTime;

    // Log AI processing event
    const log = this.aiLogRepository.create({
      userId,
      type: AiLogType.VOICE,
      inputLanguage: parsedResult.detectedLanguage || language,
      inputText: text,
      outputData: parsedResult,
      processingTimeMs: duration,
      wasConfirmed: false,
    });
    const savedLog = await this.aiLogRepository.save(log);

    return {
      aiLogId: savedLog.id,
      transcription: text,
      detectedLanguage: parsedResult.detectedLanguage || language,
      confidence: parsedResult.confidence || 0.9,
      parsedExpenses: parsedResult.expenses || [],
      missingFieldsWarning: (parsedResult.expenses || []).some(
        (e: any) => !e.amount || !e.categoryId,
      ),
    };
  }

  async parseVoiceAudio(userId: string, file: Express.Multer.File) {
    const startTime = Date.now();
    if (!file) {
      throw new BadRequestException('No audio recording provided');
    }

    const categories = await this.categoryRepository.find({
      where: { isEnabled: true },
      relations: ['subcategories'],
    });
    const paymentMethods = await this.paymentMethodRepository.find({
      where: { isEnabled: true },
    });

    const categoryContext = categories.map((c) => ({
      id: c.id,
      name: c.name,
      nameBn: c.nameBn,
    }));

    const paymentMethodContext = paymentMethods.map((p) => ({
      id: p.id,
      name: p.name,
      nameBn: p.nameBn,
    }));

    let extractedData: any = null;

    try {
      if (this.genAI) {
        const model = this.genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const audioPart = {
          inlineData: {
            data: file.buffer.toString('base64'),
            mimeType: file.mimetype || 'audio/webm',
          },
        };

        const prompt = `
You are an expert bilingual (English and Bangla) speech-to-expense parsing assistant for an expense tracker called Khoroch.
Listen to this audio recording carefully. The user may speak in English, in Bangla (Bengali), or switch back and forth between Bangla and English (code-switching) mid-sentence.

CRITICAL INSTRUCTION: The user may mention ONE or MULTIPLE expenses in the same recording (e.g. "Lunch 250 taka and rickshaw 40 taka", "বাজার করলাম ১০০০ টাকার এবং রিকশা ভাড়া দিলাম ৫০ টাকা").
You MUST extract EVERY discrete expense as an individual object in the "expenses" array! Do NOT combine or sum them together into a single item.

Tasks:
1. Accurately transcribe what the user said into "transcript". Write Bangla words in Bangla script and English words in English script (preserving numbers, loanwords, and mixed phrases).
2. Extract all discrete expenses mentioned:
   - "amount" (positive float/number)
   - "currency" (default "BDT")
   - "description" (item name / activity description)
   - "merchant" (merchant or vendor name if mentioned, otherwise null)
   - "expenseDate" (YYYY-MM-DD relative to Current Date "${new Date().toISOString().split('T')[0]}")
   - "categoryId" (the best matching category ID from the list, or null)
   - "categoryName" (matched category English name)
   - "paymentMethodId" (best matching payment method ID, or null)
   - "paymentMethodName" (matched payment method name, or null)
3. Detect the primary language ("bn", "en", or "bilingual").
4. Rate confidence (0.00 to 1.00).

Available Categories: ${JSON.stringify(categoryContext)}
Available Payment Methods: ${JSON.stringify(paymentMethodContext)}

Return ONLY valid JSON matching this exact structure:
{
  "transcript": "Transcribed speech text here...",
  "detectedLanguage": "bn",
  "confidence": 0.95,
  "expenses": [
    {
      "amount": 50,
      "currency": "BDT",
      "description": "Rickshaw fare",
      "merchant": null,
      "expenseDate": "2026-08-16",
      "categoryId": "...",
      "categoryName": "Transportation",
      "paymentMethodId": "...",
      "paymentMethodName": "Cash"
    }
  ]
}
`;

        const result = await model.generateContent([prompt, audioPart]);
        extractedData = JSON.parse(result.response.text());
      }
    } catch (error) {
      this.logger.error(`AI Audio Speech Parsing failed: ${error.message}`);
    }

    if (!extractedData) {
      extractedData = {
        transcript: 'Voice recorded transaction',
        detectedLanguage: 'auto',
        confidence: 0.8,
        expenses: [],
      };
    }

    const duration = Date.now() - startTime;

    // Log AI processing event
    const log = this.aiLogRepository.create({
      userId,
      type: AiLogType.VOICE,
      inputLanguage: extractedData.detectedLanguage || 'auto',
      inputText: extractedData.transcript || 'Audio recording',
      outputData: extractedData,
      processingTimeMs: duration,
      wasConfirmed: false,
    });
    const savedLog = await this.aiLogRepository.save(log);

    return {
      aiLogId: savedLog.id,
      transcription: extractedData.transcript || '',
      detectedLanguage: extractedData.detectedLanguage || 'auto',
      confidence: extractedData.confidence || 0.9,
      parsedExpenses: extractedData.expenses || [],
    };
  }

  async scanReceipt(userId: string, file: Express.Multer.File) {
    const startTime = Date.now();
    if (!file) {
      throw new BadRequestException('No receipt image file uploaded');
    }

    // Upload to Cloudinary with fallback
    let fileUrl = `data:${file.mimetype || 'image/jpeg'};base64,${file.buffer.toString('base64')}`;
    try {
      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'khoroch/receipts' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        uploadStream.end(file.buffer);
      });
      if (uploadResult?.secure_url) {
        fileUrl = uploadResult.secure_url;
      }
    } catch (uploadError: any) {
      this.logger.warn(`Cloudinary upload failed: ${uploadError?.message || uploadError}, using base64 fallback`);
    }
    const categories = await this.categoryRepository.find({
      where: { isEnabled: true },
      relations: ['subcategories'],
    });
    const paymentMethods = await this.paymentMethodRepository.find({
      where: { isEnabled: true },
    });

    let extractedData: any = null;

    try {
      if (this.genAI) {
        const model = this.genAI.getGenerativeModel({
          model: 'gemini-3.7-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const imagePart = {
          inlineData: {
            data: file.buffer.toString('base64'),
            mimeType: file.mimetype || 'image/jpeg',
          },
        };

        const categoryContext = categories.map((c) => ({
          id: c.id,
          name: c.name,
          nameBn: c.nameBn,
        }));

        const paymentMethodContext = paymentMethods.map((p) => ({
          id: p.id,
          name: p.name,
          nameBn: p.nameBn,
        }));

        const prompt = `
You are an expert bilingual (English and Bengali / Bangla) OCR receipt and memo scanning assistant for an expense tracker called Khoroch (খরচ).
Analyze this receipt or memo image thoroughly. The receipt may be in English, Bangla script, or a bilingual mix (e.g., supermarket receipt, restaurant bill, pharmacy cash memo, utility receipt, handwritten slip).

Tasks:
1. Identify merchant name or store title (merchant).
2. Identify receipt / invoice date in YYYY-MM-DD format (date). If only time or year is present, use current date ${new Date().toISOString().split('T')[0]}.
3. Identify total amount / Net Payable as a positive number (totalAmount).
4. Identify currency (default "BDT").
5. Categorize the receipt into one of the Available Categories (categoryId and categoryName).
6. Identify payment method (e.g. Cash, bKash, Nagad, Card) from Available Payment Methods if visible (paymentMethodId and paymentMethodName).
7. Extract all line items (items) with item name (name), quantity (quantity, default 1), unit price (unitPrice), and item total price (totalPrice).
8. Rate confidence score between 0.00 and 1.00.
9. Detect language ("bn", "en", or "bilingual").

Available Categories: ${JSON.stringify(categoryContext)}
Available Payment Methods: ${JSON.stringify(paymentMethodContext)}

Return ONLY valid JSON matching this exact structure:
{
  "merchant": "Store or Vendor Name",
  "merchantName": "Store or Vendor Name",
  "date": "YYYY-MM-DD",
  "totalAmount": 1500.00,
  "currency": "BDT",
  "categoryId": "...",
  "categoryName": "...",
  "categorySuggested": "...",
  "paymentMethodId": "...",
  "paymentMethodName": "...",
  "items": [
    {
      "name": "Item description",
      "quantity": 1,
      "unitPrice": 1500.00,
      "totalPrice": 1500.00,
      "price": 1500.00,
      "total": 1500.00
    }
  ],
  "confidence": 0.95,
  "detectedLanguage": "en"
}
`;

        const result = await model.generateContent([prompt, imagePart]);
        const textResponse = result.response.text();
        extractedData = JSON.parse(textResponse);
        if (extractedData) {
          extractedData.merchantName = extractedData.merchantName || extractedData.merchant;
          extractedData.categorySuggested = extractedData.categorySuggested || extractedData.categoryName;
        }
      }
    } catch (error) {
      this.logger.error(`AI Receipt Scanning failed: ${error.message}`);
    }

    if (!extractedData) {
      extractedData = {
        merchant: 'Receipt Vendor',
        date: new Date().toISOString().split('T')[0],
        totalAmount: 100.0,
        currency: 'BDT',
        categoryId: categories[0]?.id || null,
        categoryName: categories[0]?.name || null,
        paymentMethodId: paymentMethods[0]?.id || null,
        paymentMethodName: paymentMethods[0]?.name || null,
        items: [{ name: 'Scanned Item', quantity: 1, unitPrice: 100, totalPrice: 100 }],
        confidence: 0.7,
        detectedLanguage: 'en',
      };
    }

    // Save Receipt record
    const receipt = this.receiptRepository.create({
      userId,
      originalFilename: file.originalname,
      fileUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      aiExtractedData: extractedData,
      processingStatus: ReceiptProcessingStatus.COMPLETED,
    });
    const savedReceipt = await this.receiptRepository.save(receipt);

    // Save AI processing log
    const log = this.aiLogRepository.create({
      userId,
      type: AiLogType.RECEIPT,
      receiptId: savedReceipt.id,
      inputLanguage: extractedData.detectedLanguage || 'en',
      outputData: extractedData,
      processingTimeMs: Date.now() - startTime,
      wasConfirmed: false,
    });
    const savedLog = await this.aiLogRepository.save(log);

    return {
      receiptId: savedReceipt.id,
      fileUrl: savedReceipt.fileUrl,
      aiLogId: savedLog.id,
      extractedData,
    };
  }

  private classifyCategory(
    text: string,
    categories: Category[],
  ): { id: string | null; name: string | null } {
    const lower = text.toLowerCase();

    const categoryKeywords: { pattern: RegExp; names: string[] }[] = [
      {
        pattern: /rickshaw|রিকশা|uber|উবার|pathao|পাঠাও|cng|সিএনজি|bus|বাস|metro|মেট্রোরেল|train|ট্রেন|taxi|ট্যাক্সি|fare|ভাড়া|fuel|petrol|octane|ডিজেল|অকটেন|পেট্রোল|ride|bike|scooty|toll|টোল|transport|commute|যাতায়াত|ভাড়া/i,
        names: ['Transportation', 'Transport', 'Commute', 'যাতায়াত', 'পরিবহন'],
      },
      {
        pattern: /dinner|lunch|breakfast|meal|খাবার|লাঞ্চ|ডিনার|নাস্তা|coffee|চা|tea|cha|snacks|burger|pizza|biryani|বিরিয়ানি|restaurant|হোটেল|hotel|kacchi|কাচ্চি|grocery|bazar|bazaar|বাজার|সবজি|মাছ|মাংস|চাল|ডাল|তেল|ডিম|milk|দুধ|ফল|fruit|মিষ্টি|sweet|drink|coke|water|ফুচকা|চটপটি|ফুড|food|dining|groceries|কাঁচাবাজার/i,
        names: ['Food & Dining', 'Food', 'Groceries', 'খাবার ও ডাইনিং', 'মুদি ও বাজার'],
      },
      {
        pattern: /rent|house rent|বাসা ভাড়া|বাড়ি ভাড়া|রুম ভাড়া|ফ্ল্যাট|flat|maintenance|service charge|furniture|খাট|সোফা|housing|হোম/i,
        names: ['Housing', 'Rent', 'বাসস্থান', 'বাসা ভাড়া'],
      },
      {
        pattern: /electricity|current bill|বিদ্যুৎ বিল|কারেন্ট বিল|gas bill|গ্যাস বিল|water bill|পানির বিল|wasa|ওয়াসা|wifi|internet|broadband|ইন্টারনেট|ওয়াইফাই|mobile recharge|flexiload|রিচার্জ|netflix|subscription|dish|ডিশ|বিল|utility|bills/i,
        names: ['Bills & Subscriptions', 'Utilities', 'Bills', 'বিল ও সাবস্ক্রিপশন'],
      },
      {
        pattern: /dress|shirt|শার্ট|প্যান্ট|pant|জুতা|shoes|cloth|কাপড়|জামা|shopping|শপিং|daraz|দারাজ|market|ঘড়ি|watch|bag|ব্যাগ|cosmetics|কসমেটিকস|makeup|electronic|মোবাইল|laptop|কেনাকাটা/i,
        names: ['Shopping', 'কেনাকাটা'],
      },
      {
        pattern: /medicine|ঔষধ|ওষুধ|ডাক্তার|doctor|hospital|হাসপাতাল|clinic|pharmacy|ফার্মেসি|prescription|test|টেস্ট|dental|eye|syrup|tablet|স্যালাইন|health|medical|স্বাস্থ্য|চিকিৎসা/i,
        names: ['Health & Medical', 'Health', 'Medical', 'স্বাস্থ্য ও চিকিৎসা'],
      },
      {
        pattern: /tuition|টিউশন|fee|বেতন|স্কুল|school|college|কলেজ|university|ভার্সিটি|exam|পরীক্ষা|book|বই|খাতা|pen|কলম|coaching|কোচিং|education|শিক্ষা/i,
        names: ['Education', 'শিক্ষা'],
      },
      {
        pattern: /movie|সিনেমা|cinema|game|গেম|concert|কনসার্ট|play|park|পার্ক|outing|party|পার্টি|picnic|পিকনিক|entertainment|বিনোদন/i,
        names: ['Entertainment', 'বিনোদন'],
      },
      {
        pattern: /gift|উপহার|donation|দান|সাহায্য|pocket money|পকেট খরচ|salon|সেলুন|haircut|চুল কাটা|parlor|পার্লার|gym|জিম|personal|ব্যক্তিগত/i,
        names: ['Family & Personal', 'Personal', 'পরিবার ও ব্যক্তিগত'],
      },
      {
        pattern: /bank|ব্যাংক|fee|চার্জ|charge|tax|ট্যাক্স|vat|ভ্যাট|loan|লোন|atm|interest|সুদ|financial|আর্থিক/i,
        names: ['Financial', 'আর্থিক লেনদেন'],
      },
      {
        pattern: /pet|বিড়াল|cat|কুকুর|dog|pet food|পশুপাখি/i,
        names: ['Pets', 'পোষা প্রাণী'],
      },
    ];

    for (const rule of categoryKeywords) {
      if (rule.pattern.test(lower)) {
        const found = categories.find((c) =>
          rule.names.some(
            (n) =>
              c.name.toLowerCase() === n.toLowerCase() ||
              (c.nameBn && c.nameBn.includes(n)),
          ),
        );
        if (found) return { id: found.id, name: found.name };
      }
    }

    // Direct name matching fallback
    for (const cat of categories) {
      if (
        lower.includes(cat.name.toLowerCase()) ||
        (cat.nameBn && lower.includes(cat.nameBn.toLowerCase()))
      ) {
        return { id: cat.id, name: cat.name };
      }
    }

    // Default to Food or first category
    const defaultCat =
      categories.find((c) => c.name.toLowerCase().includes('food')) ||
      categories[0];
    return { id: defaultCat?.id || null, name: defaultCat?.name || 'General' };
  }

  private classifyPaymentMethod(
    text: string,
    paymentMethods: PaymentMethod[],
  ): { id: string | null; name: string | null } {
    const lower = text.toLowerCase();

    if (/bkash|b-kash|বিকাশ/i.test(lower)) {
      const pm = paymentMethods.find((p) => /bkash|বিকাশ/i.test(p.name));
      if (pm) return { id: pm.id, name: pm.name };
    }
    if (/nagad|নগদ/i.test(lower)) {
      const pm = paymentMethods.find((p) => /nagad|নগদ/i.test(p.name));
      if (pm) return { id: pm.id, name: pm.name };
    }
    if (/rocket|রকেট|dbbl/i.test(lower)) {
      const pm = paymentMethods.find((p) => /rocket|রকেট/i.test(p.name));
      if (pm) return { id: pm.id, name: pm.name };
    }
    if (/card|কার্ড|visa|mastercard|debit|credit|bank|ব্যাংক/i.test(lower)) {
      const pm = paymentMethods.find((p) => /card|bank|কার্ড/i.test(p.name));
      if (pm) return { id: pm.id, name: pm.name };
    }

    const cashPm =
      paymentMethods.find((p) => /cash|ক্যাশ|নগদ টাকা/i.test(p.name)) ||
      paymentMethods[0];
    return { id: cashPm?.id || null, name: cashPm?.name || 'Cash' };
  }

  private heuristicVoiceParser(
    text: string,
    categories: Category[],
    paymentMethods: PaymentMethod[],
  ) {
    const today = new Date().toISOString().split('T')[0];
    const isBengali = /[\u0980-\u09FF]/.test(text);

    // Split input into clauses using conjunctions, commas, semicolons, plus, and phrases
    const splitRegex =
      /[,;+]|\band\b|\balso\b|\bplus\b|\bthen\b|\bএবং\b|\bআর\b|\bও\b|\bতারপর\b|\bতারপরে\b|\bদিয়ে\b|\bদিলাম\b/i;

    let rawSegments = text
      .split(splitRegex)
      .map((s) => s.trim())
      .filter(Boolean);

    // If segments are only 1, check if there are multiple number occurrences (e.g. "dinner 500 coffee 150 uber 200")
    if (rawSegments.length <= 1) {
      // Find all numbers and their positions in text
      const numMatches = [...text.matchAll(/\b\d+(\.\d+)?\b/g)];
      if (numMatches.length > 1) {
        rawSegments = [];
        for (let i = 0; i < numMatches.length; i++) {
          const currentMatch = numMatches[i];
          const start = i === 0 ? 0 : numMatches[i - 1].index! + numMatches[i - 1][0].length;
          const end =
            i === numMatches.length - 1
              ? text.length
              : numMatches[i + 1].index!;
          const segmentText = text.substring(start, end).trim();
          if (segmentText) {
            rawSegments.push(segmentText);
          }
        }
      }
    }

    const expenses: any[] = [];

    for (const segment of rawSegments) {
      const numbers = segment.match(/\d+(\.\d+)?/g);
      if (numbers && numbers.length > 0) {
        const amount = parseFloat(numbers[0]);
        const catInfo = this.classifyCategory(segment, categories);
        const pmInfo = this.classifyPaymentMethod(segment, paymentMethods);

        // Clean description
        let cleanDesc = segment
          .replace(/\b\d+(\.\d+)?\b/g, '')
          .replace(/\b(taka|tk|টাকা|টাকার|bdt|for|in|on|with|paid|using|দিলাম|নিলাম|করলাম)\b/gi, '')
          .trim();

        if (!cleanDesc || cleanDesc.length < 2) {
          cleanDesc = catInfo.name || (isBengali ? 'খরচ' : 'Expense');
        }

        // Capitalize first letter
        cleanDesc = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);

        expenses.push({
          amount,
          currency: 'BDT',
          description: cleanDesc.substring(0, 60),
          merchant: null,
          expenseDate: today,
          categoryId: catInfo.id,
          categoryName: catInfo.name,
          subcategoryId: null,
          subcategoryName: null,
          paymentMethodId: pmInfo.id,
          paymentMethodName: pmInfo.name,
        });
      }
    }

    // Fallback if no number was matched
    if (expenses.length === 0) {
      const catInfo = this.classifyCategory(text, categories);
      const pmInfo = this.classifyPaymentMethod(text, paymentMethods);
      expenses.push({
        amount: 100,
        currency: 'BDT',
        description: text.substring(0, 50) || (isBengali ? 'সাধারণ খরচ' : 'General Expense'),
        merchant: null,
        expenseDate: today,
        categoryId: catInfo.id,
        categoryName: catInfo.name,
        subcategoryId: null,
        subcategoryName: null,
        paymentMethodId: pmInfo.id,
        paymentMethodName: pmInfo.name,
      });
    }

    return {
      detectedLanguage: isBengali ? 'bn' : 'en',
      confidence: 0.9,
      expenses,
    };
  }
}
