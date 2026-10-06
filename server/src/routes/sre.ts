import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import os from 'os';

const router = Router();
const startTime = Date.now();

export interface ModuleDoc {
  id: string;
  name: string;
  type: 'client' | 'server' | 'database' | 'ai' | 'audio';
  status: 'healthy' | 'degraded' | 'warning';
  summary: string;
  non_technical: {
    purpose: string;
    user_experience: string;
    business_value: string;
  };
  technical: {
    stack: string[];
    source_files: string[];
    endpoints?: string[];
    data_flow: string;
    error_handling: string;
    environment_vars?: string[];
  };
}

router.get('/metrics', async (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'degraded';

  const topology: ModuleDoc[] = [
    {
      id: 'client-spa',
      name: 'Client Mobile-First SPA',
      type: 'client',
      status: 'healthy',
      summary: 'Mobile-first React application providing interactive German conversation practice with hands-free voice I/O.',
      non_technical: {
        purpose: 'رابط کاربری پیشرفته و واکنش‌گرا که زبان‌آموز از طریق آن به صورت صوتی و زنده با هوش مصنوعی آلمانی مکالمه می‌کند، فیدبک دریافت می‌کند و پیشرفت خود را می‌بیند.',
        user_experience: 'طراحی Mobile-First مبتنی بر فیگما با حالت تاریک (Dark Mode)، دکمه‌های کنترل زنده، نمودار موج صوتی زنده (Waveform) و رهگیری اشتباهات.',
        business_value: 'تجربه کاربری سریع و روان بدون تأخیر صوتی که تعامل و درگیری کاربر (Engagement) و نگه‌داشت روزانه (Retention) را به حداکثر می‌رساند.'
      },
      technical: {
        stack: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Web Speech API', 'Web Audio API / MediaStream'],
        source_files: [
          'client/src/pages/PracticePage.tsx',
          'client/src/components/chat/VoiceRecorder.tsx',
          'client/src/lib/neuralTts.ts',
          'client/src/lib/audioStream.ts'
        ],
        data_flow: 'ضبط صدای کاربر از طریق getUserMedia و Web Speech Recognition -> ارسال متن به /api/chat -> دریافت صوت هوش مصنوعی از /api/tts و پخش پیوسته.',
        error_handling: 'حلقه هوشمند Keep-Alive با بازاتصال فوری در صورت قطعی میکروفون + فال‌بک دوگانه صوتی برای پخش در صورت قطعی سرور یا بلاک شدن Autoplay.',
        environment_vars: ['VITE_API_URL']
      }
    },
    {
      id: 'server-api',
      name: 'Backend API Gateway',
      type: 'server',
      status: 'healthy',
      summary: 'Central Express REST API gateway orchestrating chat, curriculum, progress, audio streaming, and error boundaries.',
      non_technical: {
        purpose: 'موتور مرکزی و دروازه اصلی ارتباطات برنامه که مسئول هماهنگی درخواست‌های کاربر، محاسبه پیشرفت آموزشی، و پردازش هوش مصنوعی و صوت است.',
        user_experience: 'پاسخ‌دهی آنی بدون قطعی؛ مدیریت امن داده‌ها و تضمین ارتباط پایدار با سرورهای خارجی.',
        business_value: 'تضمین پایداری سیستم (Uptime)، امنیت داده‌های کاربران، و هزینه بهینه پردازش با معماری ماژولار.'
      },
      technical: {
        stack: ['Node.js (v18+)', 'Express', 'TypeScript', 'Helmet', 'CORS', 'Morgan'],
        source_files: [
          'server/src/index.ts',
          'server/src/routes/chat.ts',
          'server/src/routes/tts.ts',
          'server/src/routes/progress.ts',
          'server/src/routes/curriculum.ts'
        ],
        endpoints: [
          'POST /api/chat',
          'POST /api/tts',
          'GET /api/curriculum',
          'GET /api/progress/:userId',
          'GET /api/mistakes/:userId'
        ],
        data_flow: 'دریافت درخواست کلاینت -> اعتبارسنجی داده‌ها -> واکشی وضعیت از MongoDB -> ارسال به Groq -> ثبت اشتباهات در MistakeLedger -> پاسخ ساختاریافته به کلاینت.',
        error_handling: 'میدل‌ور مرکزی مدیریت خطا (errorHandler) همراه با ارسال جزئیات خطا به فرانت‌اند برای دیباگ شفاف.',
        environment_vars: ['PORT', 'NODE_ENV', 'MONGODB_URI', 'GROQ_API_KEY', 'GROQ_MODEL']
      }
    },
    {
      id: 'ai-groq',
      name: 'Groq LLM Engine (Llama 3 / GPT-OSS)',
      type: 'ai',
      status: 'healthy',
      summary: 'Ultra-low latency conversational AI engine running Llama 3 models on Groq LPU hardware.',
      non_technical: {
        purpose: 'مغز متفکر هوش مصنوعی که نقش پارتنر آلمانی بومی (Frankie) را بازی می‌کند، متناسب با سطح کاربر سوال می‌پرسد و گرامر او را اصلاح می‌کند.',
        user_experience: 'پاسخ‌گویی شبه‌انسانی در کسری از ثانیه؛ عدم تکرار سوالات قبلی، تشویق مستمر کاربر و توضیح اشتباهات به زبان انگلیسی روان.',
        business_value: 'تأخیر تولید متن زیر ۵۰۰ میلی‌ثانیه که حس مکالمه تلفنی زنده و طبیعی را ایجاد می‌کند.'
      },
      technical: {
        stack: ['Groq SDK', 'openai/gpt-oss-20b', 'JSON Response Format', 'Curriculum State Machine'],
        source_files: [
          'server/src/config/groq.ts',
          'server/src/routes/chat.ts'
        ],
        endpoints: ['Groq Cloud API (https://api.groq.com/openai/v1)'],
        data_flow: 'پرامپت مهندسی‌شده با هدف تک‌موضوعی (Active Redemittel) -> استخراج JSON خروجی شامل پاسخ آلمانی، خطای کاربر، اصلاحیه و نمره روانی کلام.',
        error_handling: 'تایم‌اوت ۵ ثانیه‌ای و سیستم فال‌بک به مدل‌های پشتیبان در صورت از دسترس خارج شدن مدل پیش‌فرض.',
        environment_vars: ['GROQ_API_KEY', 'GROQ_MODEL']
      }
    },
    {
      id: 'tts-engine',
      name: 'Microsoft Edge Neural TTS Engine',
      type: 'audio',
      status: 'healthy',
      summary: 'High-fidelity neural text-to-speech audio streaming service providing native German pronunciation.',
      non_technical: {
        purpose: 'تولید صدای طبیعی، واقعی و انسانی به زبان آلمانی (لهجه استاندارد نیتیو) به جای صدای ماشینی و رباتیک مرورگر.',
        user_experience: 'زبان‌آموز تلفظ کاملاً استاندارد و با لحن طبیعی گوش می‌دهد که در تقویت لیسنینگ و لهجه بسیار حیاتی است.',
        business_value: 'ایجاد تمایز چشمگیر نسبت به رقبا از طریق کیفیت صدای فوق‌طبیعی و حس ارتباط با مربی انسانی.'
      },
      technical: {
        stack: ['msedge-tts', 'de-DE-KatjaNeural', 'MP3 Audio Stream (24kHz Mono)', 'In-Memory Buffer Cache'],
        source_files: [
          'server/src/routes/tts.ts',
          'client/src/lib/neuralTts.ts'
        ],
        endpoints: ['POST /api/tts', 'GET /api/tts'],
        data_flow: 'دریافت متن آلمانی -> اتصال وب‌سوکت به Edge TTS -> بافرینگ داده‌های صوتی MP3 -> ارسال به کلاینت همراه با کش در حافظه رم.',
        error_handling: 'تایم‌اوت ۵ ثانیه‌ای برای جلوگیری از مسدود شدن سوکت + کش ۱۰۰ آیتم اخیر + فال‌بک اتوماتیک کلاینت به Web Speech Synthesis.',
        environment_vars: []
      }
    },
    {
      id: 'mongo-db',
      name: 'MongoDB Atlas Database',
      type: 'database',
      status: dbStatus,
      summary: 'Cloud document database storing curriculum structures, user progression metrics, and historical mistake ledgers.',
      non_technical: {
        purpose: 'پایگاه داده ابری امن برای نگهداری سرفصل‌های آموزشی کتاب‌های آلمانی، امتیازات کاربر و تمام اشتباهاتی که برای تمرین نیاز دارد.',
        user_experience: 'ذخیره خودکار پیشرفت‌ها و همگام‌سازی دائمی سناریوهای حل‌شده و امتیازهای روانی گفتار.',
        business_value: 'امکان گزارش‌گیری تحلیلی از نقاط ضعف پرتکرار زبان‌آموزان و مقیاس‌پذیری افقی بالا.'
      },
      technical: {
        stack: ['MongoDB Atlas', 'Mongoose ODM', 'Replica Set Cloud Cluster'],
        source_files: [
          'server/src/config/db.ts',
          'server/src/models/Curriculum.ts',
          'server/src/models/UserProgress.ts',
          'server/src/models/MistakeLedger.ts'
        ],
        data_flow: 'شروع با اسکریپت idempotent seed -> کوئری‌های بهینه با ایندکس‌های یکتا روی user_id و chapter_id.',
        error_handling: 'مدیریت قطعی و تلاش مجدد اتصال (Auto-reconnect) همراه با وضعیت degraded در داشبورد سلامت.',
        environment_vars: ['MONGODB_URI']
      }
    }
  ];

  res.json({
    system: {
      uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
      memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      cpu_load: os.loadavg()[0],
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      environment: process.env.NODE_ENV || 'development'
    },
    topology
  });
});

export default router;
