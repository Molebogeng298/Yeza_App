export interface VoiceResult {
  text: string;
  client?: string;
  amount?: number;
  description?: string;
}

export const processVoiceCommand = (text: string): VoiceResult => {
  const lowercaseText = text.toLowerCase();
  
  // Extract amount (look for patterns like "R200", "$200", "200 dollars", etc.)
  const amountRegex = /(?:r|usd|\$)?(\d+(?:\.\d{2})?)/i;
  const amountMatch = lowercaseText.match(amountRegex);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : undefined;

  // Extract client name (look for patterns like "to [name]", "for [name]")
  const clientRegex = /(?:to|for)\s+([a-zA-Z\s]+?)(?:\s+for|\s+at|\s*$)/i;
  const clientMatch = text.match(clientRegex);
  const client = clientMatch ? clientMatch[1].trim() : undefined;

  // Extract description (everything after "for" that's not a client name)
  const descriptionRegex = /for\s+([a-zA-Z\s]+?)(?:\s+to|\s*$)/i;
  const descriptionMatch = text.match(descriptionRegex);
  const description = descriptionMatch ? descriptionMatch[1].trim() : undefined;

  return {
    text,
    client,
    amount,
    description,
  };
};

export const startVoiceRecording = async (apiKey: string): Promise<string> => {
  try {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        // Recognition ended
      };

      recognition.start();
    });
  } catch (error) {
    throw error;
  }
};