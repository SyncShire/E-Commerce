
import { supabase } from './customSupabaseClient';

export const sendEmail = async (type, recipient, data) => {
  try {
    const { data: result, error } = await supabase.functions.invoke('send-email', {
      body: { type, recipient, data }
    });

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't block UI flow if email fails, but log it
    return null;
  }
};

export const sendOrderConfirmationEmail = async (order, customerName, email) => {
  return sendEmail('order_confirmation', email, {
    order_number: order.order_number,
    total_amount: order.total_amount,
    customer_name: customerName
  });
};
