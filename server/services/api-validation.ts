// Create this file: server/services/api-validation.ts

export class ApiValidationService {
  async validateOpenAIKey(
    apiKey: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      if (response.ok) {
        return { valid: true };
      } else if (response.status === 401) {
        return { valid: false, error: "Invalid OpenAI API key" };
      } else if (response.status === 429) {
        return { valid: false, error: "OpenAI API rate limit exceeded" };
      } else {
        return { valid: false, error: `OpenAI API error: ${response.status}` };
      }
    } catch (error) {
      return {
        valid: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to validate OpenAI key",
      };
    }
  }

  async validateAnthropicKey(
    apiKey: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1,
          messages: [{ role: "user", content: "test" }],
        }),
        timeout: 10000,
      });

      if (response.ok) {
        return { valid: true };
      } else if (response.status === 401) {
        return { valid: false, error: "Invalid Anthropic API key" };
      } else if (response.status === 429) {
        return { valid: false, error: "Anthropic API rate limit exceeded" };
      } else {
        return {
          valid: false,
          error: `Anthropic API error: ${response.status}`,
        };
      }
    } catch (error) {
      return {
        valid: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to validate Anthropic key",
      };
    }
  }


async validateGooglePageSpeedKey(
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const testUrl = "https://www.google.com";
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        testUrl
      )}&key=${apiKey}&strategy=mobile`,
      {
        timeout: 10000,
      }
    );

    // Parse the response body first
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Failed to parse PageSpeed response:", parseError);
      data = {};
    }

    console.log(`PageSpeed API Response Status: ${response.status}`);
    if (data.error) {
      console.log(`PageSpeed API Error:`, data.error);
    }

    // Success case
    if (response.ok) {
      console.log("✅ Google PageSpeed API key is valid");
      return { valid: true };
    }

    // Handle 400 Bad Request errors
    if (response.status === 400) {
      const errorMessage = data.error?.message || "";
      console.error("❌ PageSpeed 400 error:", errorMessage);
      
      // Check for API key not found/invalid errors
      if (
        errorMessage.includes("API Key not found") ||
        errorMessage.includes("API key not valid") ||
        errorMessage.includes("Invalid API key") ||
        errorMessage.includes("API key invalid") ||
        errorMessage.includes("Please pass a valid API key")
      ) {
        return { 
          valid: false, 
          error: "Invalid or not found Google PageSpeed API key. Please verify your API key is correct." 
        };
      }
      
      // If it's a URL validation error (not API key), the key is probably valid
      if (
        errorMessage.includes("URL") ||
        errorMessage.includes("fetch") ||
        errorMessage.includes("cannot be fetched") ||
        errorMessage.includes("Lighthouse returned error")
      ) {
        console.log("✅ API key appears valid (URL validation error):", errorMessage);
        return { valid: true }; // Key is valid, just the test URL had issues
      }
      
      // Other 400 errors - provide the actual error message
      return {
        valid: false,
        error: `Google PageSpeed error: ${errorMessage || "Bad Request"}`,
      };
    }

    // 401 Unauthorized - definitely a key issue
    if (response.status === 401) {
      return { 
        valid: false, 
        error: "Unauthorized - Invalid Google PageSpeed API key" 
      };
    }

    // 403 Forbidden - API not enabled or permissions issue
    if (response.status === 403) {
      const errorMessage = data.error?.message || "";
      
      // Check if it's because the API isn't enabled
      if (
        errorMessage.includes("not enabled") ||
        errorMessage.includes("has not been used") ||
        errorMessage.includes("Enable it")
      ) {
        return {
          valid: false,
          error: "PageSpeed Insights API is not enabled. Please enable it in Google Cloud Console: https://console.cloud.google.com/apis/library/pagespeedonline.googleapis.com",
        };
      }
      
      return {
        valid: false,
        error: "Google PageSpeed API key lacks required permissions. Make sure the PageSpeed Insights API is enabled.",
      };
    }

    // 429 Rate limit
    if (response.status === 429) {
      return { 
        valid: false, 
        error: "Google PageSpeed API quota exceeded. Please try again later." 
      };
    }

    // Other errors
    const errorMessage = data.error?.message || `HTTP ${response.status}`;
    return {
      valid: false,
      error: `Google PageSpeed API error: ${errorMessage}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Google PageSpeed validation exception:", errorMessage);
    
    // Network errors
    if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
      return {
        valid: false,
        error: `Network error while validating API key: ${errorMessage}`,
      };
    }
    
    return {
      valid: false,
      error: `Failed to validate Google PageSpeed key: ${errorMessage}`,
    };
  }
}

  // async validateGooglePageSpeedKey(
  //   apiKey: string
  // ): Promise<{ valid: boolean; error?: string }> {
  //   try {
  //     const testUrl = "https://www.google.com";
  //     const response = await fetch(
  //       `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
  //         testUrl
  //       )}&key=${apiKey}`,
  //       {
  //         timeout: 10000,
  //       }
  //     );

  //     if (response.ok) {
  //       return { valid: true };
  //     } else if (response.status === 400) {
  //       const data = await response.json().catch(() => ({}));
  //       if (data.error?.message?.includes("API key not valid")) {
  //         return { valid: false, error: "Invalid Google PageSpeed API key" };
  //       }
  //       return {
  //         valid: false,
  //         error: "Google PageSpeed API configuration error",
  //       };
  //     } else if (response.status === 403) {
  //       return {
  //         valid: false,
  //         error: "Google PageSpeed API key lacks required permissions",
  //       };
  //     } else if (response.status === 429) {
  //       return { valid: false, error: "Google PageSpeed API quota exceeded" };
  //     } else {
  //       return {
  //         valid: false,
  //         error: `Google PageSpeed API error: ${response.status}`,
  //       };
  //     }
  //   } catch (error) {
  //     return {
  //       valid: false,
  //       error:
  //         error instanceof Error
  //           ? error.message
  //           : "Failed to validate Google PageSpeed key",
  //     };
  //   }
  // }

  async validateApiKey(
    provider: string,
    apiKey: string
  ): Promise<{ valid: boolean; error?: string }> {
    switch (provider) {
      case "openai":
        return this.validateOpenAIKey(apiKey);
      case "anthropic":
        return this.validateAnthropicKey(apiKey);
      case "google_pagespeed":
        return this.validateGooglePageSpeedKey(apiKey);
      default:
        return { valid: false, error: "Unsupported provider" };
    }
  }

  getProviderDisplayName(provider: string): string {
    switch (provider) {
      case "openai":
        return "OpenAI GPT-4";
      case "anthropic":
        return "Anthropic Claude";
      case "google_pagespeed":
        return "Google PageSpeed Insights";
      default:
        return provider;
    }
  }

  getSupportedProviders(): string[] {
    return ["openai", "anthropic", "google_pagespeed"];
  }
}

export const apiValidationService = new ApiValidationService();
