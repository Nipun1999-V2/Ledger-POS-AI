package com.posapp.service;

import com.posapp.dto.response.AnalyticsReportResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Produces the natural-language summary of an analytics report.
 *
 * If ANTHROPIC_API_KEY is configured, the computed statistics are handed to
 * Claude to write a short, plain-English analyst summary. Without a key,
 * a rule-based narrative is generated locally from the same numbers, so the
 * report feature always works out of the box.
 */
@Service
public class NarrativeReportService {

    private final WebClient webClient;

    @Value("${app.ai.anthropic-api-key:}")
    private String apiKey;

    @Value("${app.ai.anthropic-model:claude-sonnet-4-6}")
    private String model;

    public NarrativeReportService(WebClient webClient) {
        this.webClient = webClient;
    }

    public String generate(AnalyticsReportResponse report) {
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                return generateWithClaude(report);
            } catch (Exception e) {
                // Fall through to the rule-based narrative if the API call fails for any reason
                // (missing network access, invalid key, rate limit, etc.) so reporting never breaks.
                return generateRuleBased(report);
            }
        }
        return generateRuleBased(report);
    }

    private String generateWithClaude(AnalyticsReportResponse r) {
        String topItems = r.getTopSellingItems().stream()
                .map(i -> i.getItemName() + " (" + i.getQuantitySold() + " units, revenue " + i.getRevenue() + ")")
                .reduce((a, b) -> a + "; " + b).orElse("none");

        String prompt = String.format("""
                You are a retail analyst. Write a concise 3-4 sentence plain-English summary of this
                %s sales report for a shop owner. Be specific with numbers, mention the trend versus
                the previous period, call out anything that needs attention. No preamble, no headers.

                Period: %s to %s
                Total revenue: %s
                Total orders: %d
                Average order value: %s
                Revenue change vs previous period: %s%%
                Top selling items: %s
                """,
                r.getPeriodType(), r.getPeriodStart(), r.getPeriodEnd(), r.getTotalRevenue(),
                r.getTotalOrders(), r.getAverageOrderValue(), r.getRevenueChangePct(), topItems);

        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", 300,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        Map<?, ?> response = webClient.post()
                .uri("https://api.anthropic.com/v1/messages")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block(Duration.ofSeconds(20));

        List<?> content = (List<?>) response.get("content");
        Map<?, ?> firstBlock = (Map<?, ?>) content.get(0);
        return (String) firstBlock.get("text");
    }

    private String generateRuleBased(AnalyticsReportResponse r) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Over this %s (%s to %s), the business made %s in revenue across %d orders",
                r.getPeriodType().toLowerCase(), r.getPeriodStart(), r.getPeriodEnd(),
                r.getTotalRevenue(), r.getTotalOrders()));

        if (r.getRevenueChangePct() != null) {
            int cmp = r.getRevenueChangePct().signum();
            String direction = cmp > 0 ? "up" : cmp < 0 ? "down" : "flat versus";
            sb.append(String.format(", %s %s%% compared to the previous period", direction,
                    r.getRevenueChangePct().abs()));
        }
        sb.append(String.format(", with an average order value of %s. ", r.getAverageOrderValue()));

        if (!r.getTopSellingItems().isEmpty()) {
            var top = r.getTopSellingItems().get(0);
            sb.append(String.format("%s was the best seller with %s units sold. ",
                    top.getItemName(), top.getQuantitySold()));
        }
        if (!r.getLowPerformingItems().isEmpty()) {
            var low = r.getLowPerformingItems().get(0);
            sb.append(String.format("%s moved the least, which may be worth reviewing pricing or promotion on.",
                    low.getItemName()));
        }
        return sb.toString();
    }
}
