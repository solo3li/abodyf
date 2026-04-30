export const DUMMY_CATEGORIES = [
  { id: '1', title: 'مشاريع تخرج', icon: 'school-outline', color: '#EFF6FF' },
  { id: '2', title: 'شرح مواد', icon: 'book-outline', color: '#FEF2F2' },
  { id: '3', title: 'تصميم', icon: 'color-palette-outline', color: '#F0FDF4' },
  { id: '4', title: 'ترجمة', icon: 'language-outline', color: '#FFFBEB' },
  { id: '5', title: 'استعلامات', icon: 'information-circle-outline', color: '#FDF4FF' },
  { id: '6', title: 'برمجة', icon: 'code-slash-outline', color: '#EEF2FF' },
  { id: '7', title: 'طباعة وتسليم', icon: 'print-outline', color: '#F8FAFC' },
  { id: '8', title: 'أبحاث', icon: 'search-outline', color: '#FEF2F2' },
  { id: '9', title: 'مراجعة وتقييم', icon: 'checkmark-done-outline', color: '#ECFEFF' },
  { id: '10', title: 'تحليل بيانات', icon: 'bar-chart-outline', color: '#FDF2F8' },
  { id: '11', title: 'تصميم بوسترات', icon: 'easel-outline', color: '#F0F9FF' },
  { id: '12', title: 'كتابة CV', icon: 'document-text-outline', color: '#FFF1F2' },
];

export const DUMMY_SERVICES = [
  {
    id: 's1',
    title: 'تصميم عرض تقديمي احترافي لمشروع التخرج',
    provider: 'أحمد محمود',
    providerAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    price: 150,
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=600&auto=format&fit=crop',
    deliveryTime: 'يومين',
    category: 'تصميم',
  },
  {
    id: 's2',
    title: 'شرح مادة البرمجة الكينونية OOP خطوة بخطوة',
    provider: 'د. سارة',
    providerAvatar: 'https://i.pravatar.cc/150?u=a04258a2462d826712d',
    price: 200,
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
    deliveryTime: 'ساعتين',
    category: 'شرح مواد',
  },
  {
    id: 's3',
    title: 'كتابة وتنسيق بحث علمي بمراجع موثوقة',
    provider: 'محمد علي',
    providerAvatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d',
    price: 300,
    rating: 4.7,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=600&auto=format&fit=crop',
    deliveryTime: '5 أيام',
    category: 'أبحاث',
  },
  {
    id: 's4',
    title: 'ترجمة أكاديمية للمقالات العلمية من الإنجليزية',
    provider: 'مريم حسن',
    providerAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    price: 100,
    rating: 4.6,
    reviews: 45,
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600&auto=format&fit=crop',
    deliveryTime: 'يوم واحد',
    category: 'ترجمة',
  },
  {
    id: 's5',
    title: 'مراجعة وتصحيح أخطاء كود React Native',
    provider: 'عمر كمال',
    providerAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
    price: 250,
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
    deliveryTime: 'يوم واحد',
    category: 'برمجة',
  },
  {
    id: 's6',
    title: 'طباعة وتسليم أوراق للجامعة - جامعة القاهرة',
    provider: 'محمود سيد',
    providerAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
    price: 50,
    rating: 4.5,
    reviews: 320,
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=600&auto=format&fit=crop',
    deliveryTime: 'نفس اليوم',
    category: 'طباعة وتسليم',
  },
];

export const DUMMY_ORDERS = [
  {
    id: 'ORD-2023-001',
    serviceTitle: 'تصميم عرض تقديمي احترافي',
    status: 'قيد التنفيذ',
    date: '2023-10-25',
    price: 150,
  },
  {
    id: 'ORD-2023-002',
    serviceTitle: 'مراجعة كود مشروع التخرج',
    status: 'مكتمل',
    date: '2023-10-20',
    price: 450,
  },
  {
    id: 'ORD-2023-003',
    serviceTitle: 'ترجمة بحث التخرج',
    status: 'بانتظار الرد',
    date: '2023-10-26',
    price: 200,
  },
];

export const DUMMY_EXECUTOR_ORDERS = [
  {
    id: 'EX-ORD-001',
    serviceTitle: 'تصميم بوستر علمي لمناقشة مشروع التخرج',
    status: 'متاح',
    date: '2023-11-01',
    price: 180,
    customerName: 'سعيد عبدلله',
    deadline: '2 أيام',
  },
  {
    id: 'EX-ORD-002',
    serviceTitle: 'كتابة CV',
    status: 'قيد التنفيذ',
    date: '2023-11-02',
    price: 80,
    customerName: 'فاطمة الزهراء',
    deadline: '1 يوم',
  }
];

export const DUMMY_TICKETS = [
  {
    id: 'TCK-9901',
    subject: 'مشكلة في تسليم الطلب ORD-2023-001',
    status: 'مفتوحة',
    date: '2023-10-28',
    lastUpdate: 'منذ ساعتين',
  },
  {
    id: 'TCK-9902',
    subject: 'استفسار بخصوص الرصيد',
    status: 'مغلقة',
    date: '2023-10-15',
    lastUpdate: 'منذ أسبوع',
  }
];

export const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'مرحباً بك في UIS',
    description: 'بوابتك الشاملة لجميع الخدمات الجامعية والأكاديمية التي تحتاجها.',
    lottie: 'https://assets3.lottiefiles.com/packages/lf20_1pxqjqps.json'
  },
  {
    id: '2',
    title: 'اطلب خدمتك بسهولة',
    description: 'ابحث عن الخدمة، تواصل مع أفضل مقدمي الخدمات، واضمن تنفيذ طلبك بأعلى جودة.',
    lottie: 'https://assets5.lottiefiles.com/packages/lf20_QpolL2.json'
  },
  {
    id: '3',
    title: 'أمان وضمان لحقوقك',
    description: 'نظام الدفع الآمن يضمن لك استلام طلبك بالشكل المطلوب قبل تحويل المبلغ.',
    lottie: 'https://assets2.lottiefiles.com/packages/lf20_jcikmacf.json'
  }
];

export const DUMMY_MESSAGES = [
  { id: '1', text: 'السلام عليكم، هل يمكنك تنفيذ الطلب في يومين؟', isSender: true, time: '10:00 ص' },
  { id: '2', text: 'وعليكم السلام، نعم بالتأكيد. سأبدأ العمل عليه فوراً.', isSender: false, time: '10:05 ص' },
  { id: '3', text: 'شكراً جزيلاً لك.', isSender: true, time: '10:06 ص' },
  { id: '4', text: 'العفو، سأوافيك بالتحديثات.', isSender: false, time: '10:10 ص' },
];
