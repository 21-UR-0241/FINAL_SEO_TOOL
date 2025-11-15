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
      )}&key=${apiKey}`,
      {
        timeout: 10000,
      }
    );

    // Parse the response body first
    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    // Success case
    if (response.ok) {
      return { valid: true };
    }

    // Handle different error statuses
    if (response.status === 400) {
      const errorMessage = data.error?.message || "";
      
      // Check for specific API key errors
      if (
        errorMessage.includes("API key not valid") ||
        errorMessage.includes("Invalid API key") ||
        errorMessage.includes("API key invalid")
      ) {
        return { valid: false, error: "Invalid Google PageSpeed API key" };
      }
      
      // If it's a URL validation error (not API key), the key is probably valid
      if (
        errorMessage.includes("URL") ||
        errorMessage.includes("fetch") ||
        errorMessage.includes("cannot be fetched")
      ) {
        console.log("✅ API key appears valid (URL validation error):", errorMessage);
        return { valid: true }; // ← Key is valid, just the test URL failed
      }
      
      // Other 400 errors
      return {
        valid: false,
        error: `Google PageSpeed error: ${errorMessage || "Bad Request"}`,
      };
    }

    // 401 Unauthorized - definitely a key issue
    if (response.status === 401) {
      return { valid: false, error: "Invalid Google PageSpeed API key (Unauthorized)" };
    }

    // 403 Forbidden - permissions issue
    if (response.status === 403) {
      return {
        valid: false,
        error: "Google PageSpeed API key lacks required permissions. Enable the 'PageSpeed Insights API' in Google Cloud Console.",
      };
    }

    // 429 Rate limit
    if (response.status === 429) {
      return { valid: false, error: "Google PageSpeed API quota exceeded" };
    }

    // Other errors
    return {
      valid: false,
      error: `Google PageSpeed API error: ${response.status}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Google PageSpeed validation error:", errorMessage);
    
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
