package com.vedavyaas.mlservice.model;

import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.stereotype.Component;

@Component
public class AIModel {
    private final OllamaChatModel chatModel;

    private static final String SYSTEM_PROMPT =
            "You are a debt collection performance analyst. " +
            "You will be given an agent's statistics and must output exactly two comma-separated numbers:\n" +
            "  1. trust_score  – a decimal between 0.0 and 1.0 representing how trustworthy the agent is\n" +
            "  2. nice_value   – an integer between 0 and 100 representing the agent's workload suitability\n\n" +
            "Output ONLY the two values separated by a comma, nothing else. Example: 0.82,67\n\n" +
            "Agent statistics format: agent_name, cases_pending, cases_solved, success_rate, average_resolution_time";

    public AIModel(OllamaChatModel chatModel) {
        this.chatModel = chatModel;
    }

    public String query(String message) {
        String[] inputs = message.split("EOF");
        if (inputs.length < 5) {
            throw new IllegalArgumentException("Expected 5 fields, got: " + inputs.length);
        }

        String userMessage = String.format(
                "Agent name: %s, Cases pending: %s, Cases solved: %s, Success rate: %s, Average resolution time: %s",
                inputs[0], inputs[1], inputs[2], inputs[3], inputs[4]
        );

        ChatResponse chatResponse = chatModel.call(new Prompt(SYSTEM_PROMPT + "\n\n" + userMessage));
        String output = chatResponse.getResult().getOutput().getText().trim();

        String[] parts = output.split(",");
        String trustScore = parts[0].trim();
        String niceValue  = parts[1].trim();

        // agent_nameEOFtrust_scoreEOFnice_value
        return inputs[0] + "EOF" + trustScore + "EOF" + niceValue;
    }
}
