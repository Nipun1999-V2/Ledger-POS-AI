package com.posapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    /**
     * Generic WebClient used by NarrativeReportService to optionally call an
     * LLM (e.g. the Claude API) for natural-language analyst report summaries.
     * The app works fully without this being called - see NarrativeReportService.
     */
    @Bean
    public WebClient webClient() {
        return WebClient.builder().build();
    }
}
