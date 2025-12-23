
import { config } from '@/lib/config';

// Centralized currency configuration
export const currencyConfig = {
  symbol: config.currency.symbol,
  code: config.currency.code,
  locale: 'en-US' // keeping locale static for now, or could be configurable too
};

export const formatCurrency = (amount) => {
  const value = parseFloat(amount);
  if (isNaN(value)) return `${currencyConfig.symbol}0.00`;
  
  return `${currencyConfig.symbol}${value.toFixed(2)}`;
};
