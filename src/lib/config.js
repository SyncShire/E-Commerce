
export const config = {
  appName: import.meta.env.VITE_APP_NAME || 'ShopVibe',
  appLogo: import.meta.env.VITE_APP_LOGO_URL || null,
  currency: {
    symbol: import.meta.env.VITE_CURRENCY_SYMBOL || '₹',
    code: import.meta.env.VITE_CURRENCY_CODE || 'INR',
  },
  heroImage: import.meta.env.VITE_HERO_IMAGE_URL || "https://res.cloudinary.com/dghfevp6w/image/upload/v1766063515/pixalair/photo-1764845181561-89fea2be7169_trskl6.jpg",
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_3X7EekVFjLtIgT",
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  },
  analytics: {
    enabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  },
  footer: {
    poweredByText: import.meta.env.VITE_POWERED_BY_TEXT || 'Powered by syncshire',
    poweredByLogo: import.meta.env.VITE_POWERED_BY_LOGO || 'https://res.cloudinary.com/dghfevp6w/image/upload/v1761227685/InvoiceManagement/lzbetycj3wfx59fpcliz.png'
  },
  returnWindowDays: parseInt(import.meta.env.VITE_RETURN_WINDOW_DAYS || '7', 10)
};
