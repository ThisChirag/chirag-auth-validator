import axios from 'axios';

const ZEROBOUNCE_API_KEY = process.env.ZEROBOUNCE_API_KEY || '';

export const validateEmailSMTP = async (email: string): Promise<boolean> => {
  try {
    // Call the ZeroBounce API, {put your ZeroBounceKey in .env}
    const response = await axios.get('https://api.zerobounce.net/v2/validate', {
      params: {
        api_key: ZEROBOUNCE_API_KEY,
        email,
      },
    });

    const { status, sub_status, free_email, mx_found } = response.data;
    console.log(`ZeroBounce validation result for ${email}:`, response.data);

    // Check email validation rules
    if (status === 'valid' && mx_found) {
      return true; // Email is valid and able to receive emails
    }

    // Log and return false for invalid or risky emails
    console.warn(
      `Email validation failed: Status=${status}, SubStatus=${sub_status}`,
    );
    return false;
  } catch (error) {
    console.error('Error validating email with ZeroBounce:', error);
    return false; // Treat as invalid if validation fails
  }
};
