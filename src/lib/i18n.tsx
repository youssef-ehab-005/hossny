import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

const dict: Dict = {
  // nav
  "nav.women": { en: "Women", ar: "نساء" },
  "nav.men": { en: "Men", ar: "رجال" },
  "nav.kids": { en: "Kids", ar: "أطفال" },
  "nav.shoes": { en: "Shoes", ar: "أحذية" },
  "nav.accessories": { en: "Accessories", ar: "إكسسوارات" },
  // header actions
  "header.menu": { en: "Menu", ar: "القائمة" },
  "header.search": { en: "Search for products, brands…", ar: "ابحث عن المنتجات والعلامات…" },
  "header.popular": { en: "Popular searches", ar: "عمليات البحث الشائعة" },
  "header.shopAll": { en: "Shop All", ar: "تسوق الكل" },
  "header.about": { en: "About", ar: "من نحن" },
  "header.contact": { en: "Contact", ar: "تواصل معنا" },
  "header.account": { en: "Account", ar: "حسابي" },
  "header.lightMode": { en: "Light mode", ar: "الوضع الفاتح" },
  "header.darkMode": { en: "Dark mode", ar: "الوضع الداكن" },
  "header.shopAllCollection": { en: "Shop all", ar: "تسوق الكل" },

  // promo
  "promo.freeShipping": { en: "Free shipping over 150 EGP", ar: "شحن مجاني للطلبات فوق ١٥٠ ج.م" },

  // common
  "common.save": { en: "Save", ar: "حفظ" },
  "common.cancel": { en: "Cancel", ar: "إلغاء" },
  "common.edit": { en: "Edit", ar: "تعديل" },
  "common.delete": { en: "Delete", ar: "حذف" },
  "common.add": { en: "Add", ar: "إضافة" },
  "common.search": { en: "Search…", ar: "بحث…" },
  "common.loading": { en: "Loading…", ar: "جارٍ التحميل…" },

  // footer
  "footer.join": { en: "Join the Off Track list", ar: "انضم إلى قائمة Off Track" },
  "footer.joinDesc": {
    en: "Be first to access new collections, private sales and style edits — direct to your inbox.",
    ar: "كن أول من يطّلع على المجموعات الجديدة والعروض الخاصة — مباشرة إلى بريدك.",
  },
  "footer.emailPlaceholder": { en: "Email address", ar: "البريد الإلكتروني" },
  "footer.subscribe": { en: "Subscribe", ar: "اشتراك" },
  "footer.tagline": {
    en: "Modern essentials. Considered design, premium materials, and timeless silhouettes.",
    ar: "أساسيات عصرية. تصميم مدروس، خامات فاخرة، وقصّات خالدة.",
  },
  "footer.shop": { en: "Shop", ar: "تسوق" },
  "footer.help": { en: "Help", ar: "المساعدة" },
  "footer.company": { en: "Company", ar: "الشركة" },
  "footer.contact": { en: "Contact", ar: "تواصل معنا" },
  "footer.faq": { en: "FAQ", ar: "الأسئلة الشائعة" },
  "footer.orderTracking": { en: "Order Tracking", ar: "تتبع الطلب" },
  "footer.shippingReturns": { en: "Shipping & Returns", ar: "الشحن والإرجاع" },
  "footer.about": { en: "About", ar: "من نحن" },
  "footer.privacy": { en: "Privacy Policy", ar: "سياسة الخصوصية" },
  "footer.terms": { en: "Terms & Conditions", ar: "الشروط والأحكام" },
  "footer.careers": { en: "Careers", ar: "الوظائف" },
  "footer.rights": { en: "All rights reserved.", ar: "جميع الحقوق محفوظة." },
  "footer.secure": { en: "Secure Checkout", ar: "دفع آمن" },

  // admin layout
  "admin.dashboard": { en: "Admin Dashboard", ar: "لوحة التحكم" },
  "admin.viewStore": { en: "View store", ar: "عرض المتجر" },
  "admin.signOut": { en: "Sign out", ar: "تسجيل الخروج" },
  "admin.actions": { en: "Actions", ar: "إجراءات" },
  "admin.nav.dashboard": { en: "Dashboard", ar: "الرئيسية" },
  "admin.nav.products": { en: "Products", ar: "المنتجات" },
  "admin.nav.categories": { en: "Categories", ar: "الفئات" },
  "admin.nav.orders": { en: "Orders", ar: "الطلبات" },
  "admin.nav.users": { en: "Admins", ar: "المشرفون" },
  "admin.nav.settings": { en: "Store Settings", ar: "إعدادات المتجر" },
  "admin.nav.appearance": { en: "Appearance", ar: "المظهر" },

  // admin appearance
  "admin.appearance.title": { en: "Appearance", ar: "المظهر" },
  "admin.appearance.subtitle": { en: "Manage homepage visuals like the hero image.", ar: "تحكّم في صور الصفحة الرئيسية مثل صورة الغلاف." },
  "admin.appearance.heroImage": { en: "Homepage hero image", ar: "صورة غلاف الصفحة الرئيسية" },
  "admin.appearance.selectImage": { en: "Select image", ar: "اختر صورة" },
  "admin.appearance.changeImage": { en: "Change image", ar: "تغيير الصورة" },
  "admin.appearance.heroRequired": { en: "Please select an image.", ar: "من فضلك اختر صورة." },
  "admin.appearance.uploading": { en: "Uploading image…", ar: "جارٍ رفع الصورة…" },
  "admin.appearance.saved": { en: "Hero image updated", ar: "تم تحديث صورة الغلاف" },

  // admin categories
  "admin.cat.title": { en: "Categories", ar: "الفئات" },
  "admin.cat.subtitle": { en: "Create, edit and remove product categories.", ar: "أنشئ الفئات وعدّلها واحذفها." },
  "admin.cat.add": { en: "Add category", ar: "إضافة فئة" },
  "admin.cat.edit": { en: "Edit category", ar: "تعديل الفئة" },
  "admin.cat.empty": { en: "No categories yet.", ar: "لا توجد فئات بعد." },
  "admin.cat.label": { en: "Name", ar: "الاسم" },
  "admin.cat.slug": { en: "Slug", ar: "المعرف" },
  "admin.cat.order": { en: "Sort order", ar: "الترتيب" },
  "admin.cat.saved": { en: "Category saved", ar: "تم حفظ الفئة" },
  "admin.cat.deleted": { en: "Category deleted", ar: "تم حذف الفئة" },
  "admin.cat.confirmDelete": { en: "Delete this category?", ar: "حذف هذه الفئة؟" },
  "admin.cat.image": { en: "Image", ar: "الصورة" },
  "admin.cat.imageRequired": { en: "Category image is required.", ar: "صورة الفئة مطلوبة." },
  "admin.cat.selectImage": { en: "Select image", ar: "اختر صورة" },
  "admin.cat.changeImage": { en: "Change image", ar: "تغيير الصورة" },
  "admin.cat.uploading": { en: "Uploading image…", ar: "جارٍ رفع الصورة…" },

  // admin users
  "admin.users.title": { en: "Admin Users", ar: "حسابات المشرفين" },
  "admin.users.subtitle": { en: "Create and manage administrator accounts.", ar: "أنشئ حسابات المشرفين وأدرها." },
  "admin.users.add": { en: "Add admin", ar: "إضافة مشرف" },
  "admin.users.empty": { en: "No admins found.", ar: "لا يوجد مشرفون." },
  "admin.users.name": { en: "Name", ar: "الاسم" },
  "admin.users.email": { en: "Email", ar: "البريد الإلكتروني" },
  "admin.users.password": { en: "Password", ar: "كلمة المرور" },
  "admin.users.newPassword": { en: "New password", ar: "كلمة مرور جديدة" },
  "admin.users.you": { en: "You", ar: "أنت" },
  "admin.users.resetPw": { en: "Reset password", ar: "إعادة تعيين كلمة المرور" },
  "admin.users.confirmDelete": { en: "Delete this admin account?", ar: "حذف حساب المشرف هذا؟" },
  "admin.users.created": { en: "Admin created", ar: "تم إنشاء المشرف" },
  "admin.users.deleted": { en: "Admin deleted", ar: "تم حذف المشرف" },
  "admin.users.pwUpdated": { en: "Password updated", ar: "تم تحديث كلمة المرور" },
};


interface I18nState {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nState | null>(null);

function applyLang(lang: Lang) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", dir);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("uw_lang") as Lang | null;
    const initial: Lang = stored === "ar" || stored === "en" ? stored : "en";
    setLangState(initial);
    applyLang(initial);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("uw_lang", l);
    applyLang(l);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "ar" : "en");
  }, [lang, setLang]);

  const t = useCallback(
    (key: string) => {
      const entry = dict[key];
      if (!entry) return key;
      return entry[lang];
    },
    [lang],
  );

  return (
    <I18nContext.Provider
      value={{ lang, dir: lang === "ar" ? "rtl" : "ltr", setLang, toggleLang, t }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
