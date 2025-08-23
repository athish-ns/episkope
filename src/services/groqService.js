// Groq API service for text summarization
class GroqService {
  constructor() {
    this.apiKey = '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';
    this.baseUrl = 'https://api.groq.com/openai/v1';
    this.model = 'llama3-8b-8192'; // Default model, can be changed
  }

  async summarizeText(text, maxLength = 200) {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured. Please set REACT_APP_GROQ_API_KEY environment variable.');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for summarization');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: `You are an expert in summarizing patient feedback. 
              Your job is to produce clear, concise summaries of patient reviews that capture the overall sentiment, main points, and key concerns or praise. 
              Write in a professional and empathetic tone suitable for healthcare settings. 
              Do not add or invent details. 
              Keep the summary under ${maxLength} characters. 
              If the review is too short to summarize, return it as is. 
              After the summary, provide 1–2 improvement tips on how to improve in my field.`
            },
            {
              role: "user",
              content: `Please summarize the following patient review and then provide improvement tips:\n\n${text}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
          top_p: 1,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content;

      if (!summary) {
        throw new Error('No summary generated from Groq API');
      }

      return {
        success: true,
        summary: summary.trim(),
        originalLength: text.length,
        summaryLength: summary.length,
        model: this.model
      };

    } catch (error) {
      console.error('Error calling Groq API:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackSummary(text, maxLength)
      };
    }
  }

  async summarizeReviews(reviews, maxLength = 300) {
    if (!reviews || reviews.length === 0) {
      throw new Error('No reviews provided for summarization');
    }

    // Combine all review comments into one text
    const combinedText = reviews
      .map(review => review.comments || '')
      .filter(comment => comment.trim().length > 0)
      .join('\n\n');

    if (combinedText.trim().length === 0) {
      return {
        success: true,
        summary: 'No detailed comments found in reviews.',
        originalLength: 0,
        summaryLength: 0,
        model: this.model
      };
    }

    return await this.summarizeText(combinedText, maxLength);
  }

  async summarizeSessionNotes(notes, maxLength = 250) {
    if (!notes || notes.length === 0) {
      throw new Error('No session notes provided for summarization');
    }

    // Combine all session notes into one text
    const combinedText = notes
      .map(note => note.content || note.notes || '')
      .filter(note => note.trim().length > 0)
      .join('\n\n');

    if (combinedText.trim().length === 0) {
      return {
        success: true,
        summary: 'No detailed notes found in sessions.',
        originalLength: 0,
        summaryLength: 0,
        model: this.model
      };
    }

    return await this.summarizeText(combinedText, maxLength);
  }

  async assessInjurySeverity(injuryDescription) {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured. Please set REACT_APP_GROQ_API_KEY environment variable.');
    }

    if (!injuryDescription || injuryDescription.trim().length === 0) {
      throw new Error('No injury description provided for assessment');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: `You are an expert medical professional specializing in injury assessment and triage. 
              Your job is to assess the severity of injuries and medical emergencies based on descriptions provided.
              
              Assessment Scale:
              - 0-5: Low severity (minor injuries, stable condition, routine care needed)
              - 5-8: Moderate severity (moderate injuries, some risk, specialized care recommended)
              - 8-10: Extreme severity (serious injuries, high risk, immediate intensive care required)
              
              Provide your response in this exact JSON format:
              {
                "severity": <number 0-10>,
                "severityLevel": "<low|moderate|extreme>",
                "riskFactors": ["<risk factor 1>", "<risk factor 2>"],
                "recommendedCare": "<care recommendation>",
                "urgency": "<low|medium|high>",
                "buddyTier": "<bronze|silver|gold>"
              }
              
              Base your assessment on:
              - Type and location of injury
              - Pain level and symptoms
              - Risk of complications
              - Need for immediate intervention
              - Recovery time estimates
              
              Be thorough but objective. Consider both immediate risks and long-term implications.`
            },
            {
              role: "user",
              content: `Please assess the severity of this injury/medical condition:\n\n${injuryDescription}`
            }
          ],
          max_tokens: 800,
          temperature: 0.2,
          top_p: 1,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const assessmentText = data.choices?.[0]?.message?.content;

      if (!assessmentText) {
        throw new Error('No assessment generated from Groq API');
      }

      // Parse the JSON response
      let assessment;
      try {
        assessment = JSON.parse(assessmentText);
      } catch (parseError) {
        console.error('Failed to parse Groq API response as JSON:', parseError);
        // Fallback to manual parsing if JSON parsing fails
        assessment = this.parseAssessmentFallback(assessmentText);
      }

      // Validate the assessment structure
      if (!assessment.severity || !assessment.buddyTier) {
        throw new Error('Invalid assessment structure received from API');
      }

      return {
        success: true,
        assessment: assessment,
        originalDescription: injuryDescription,
        model: this.model
      };

    } catch (error) {
      console.error('Error calling Groq API for injury assessment:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackAssessment(injuryDescription)
      };
    }
  }

  parseAssessmentFallback(assessmentText) {
    // Fallback parsing if JSON parsing fails
    try {
      const severityMatch = assessmentText.match(/severity["\s:]+(\d+(?:\.\d+)?)/i);
      const severity = severityMatch ? parseFloat(severityMatch[1]) : 5;
      
      let severityLevel, buddyTier;
      if (severity <= 5) {
        severityLevel = 'low';
        buddyTier = 'bronze';
      } else if (severity <= 8) {
        severityLevel = 'moderate';
        buddyTier = 'silver';
      } else {
        severityLevel = 'extreme';
        buddyTier = 'gold';
      }

      return {
        severity: severity,
        severityLevel: severityLevel,
        riskFactors: ['Unable to parse specific risk factors'],
        recommendedCare: 'Standard care based on severity level',
        urgency: severity <= 5 ? 'low' : severity <= 8 ? 'medium' : 'high',
        buddyTier: buddyTier
      };
    } catch (error) {
      console.error('Error in fallback assessment parsing:', error);
      return {
        severity: 5,
        severityLevel: 'moderate',
        riskFactors: ['Assessment parsing failed'],
        recommendedCare: 'Standard care recommended',
        urgency: 'medium',
        buddyTier: 'silver'
      };
    }
  }

  generateFallbackAssessment(injuryDescription) {
    // Simple fallback assessment when API fails
    const description = injuryDescription.toLowerCase();
    
    // Basic keyword-based assessment
    let severity = 5; // Default moderate
    let severityLevel = 'moderate';
    let buddyTier = 'silver';
    let urgency = 'medium';
    
    // High severity indicators
    if (description.includes('bleeding') || description.includes('fracture') || 
        description.includes('head injury') || description.includes('chest pain') ||
        description.includes('unconscious') || description.includes('severe pain')) {
      severity = 9;
      severityLevel = 'extreme';
      buddyTier = 'gold';
      urgency = 'high';
    }
    // Low severity indicators
    else if (description.includes('minor') || description.includes('scrape') || 
             description.includes('bruise') || description.includes('slight') ||
             description.includes('mild')) {
      severity = 3;
      severityLevel = 'low';
      buddyTier = 'bronze';
      urgency = 'low';
    }

    return {
      success: true,
      assessment: {
        severity: severity,
        severityLevel: severityLevel,
        riskFactors: ['Fallback assessment used due to API failure'],
        recommendedCare: 'Standard care based on severity level',
        urgency: urgency,
        buddyTier: buddyTier
      },
      originalDescription: injuryDescription,
      model: this.model,
      isFallback: true
    };
  }

  generateFallbackSummary(text, maxLength) {
    // Simple fallback summarization when API fails
    if (text.length <= maxLength) {
      return text;
    }

    // Split into sentences and take first few
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let summary = '';
    
    for (const sentence of sentences) {
      if ((summary + sentence).length <= maxLength) {
        summary += sentence + '. ';
      } else {
        break;
      }
    }

    return summary.trim() || text.substring(0, maxLength) + '...';
  }

  // Method to change the model
  setModel(model) {
    this.model = model;
  }

  // Method to check API key configuration
  isConfigured() {
    return !!this.apiKey;
  }
}

const groqService = new GroqService();
export default groqService;
