package com.vedavyaas.assignment.repository;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class AgentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String agentName;
    private Integer casesPending;
    private Integer casesSolved;
    private Integer niceValue;
    private Double trustScore;
    private Double successRate;
    private Double averageResolutionTime;

    public AgentEntity() {
    }

    public AgentEntity(String agentName) {
        this.agentName = agentName;
        this.casesPending = this.casesSolved = this.niceValue = 0;
        this.trustScore = this.successRate = this.averageResolutionTime = 0.0;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getAgentName() {
        return agentName;
    }

    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }

    public Integer getCasesPending() {
        return casesPending;
    }

    public void setCasesPending(Integer casesPending) {
        this.casesPending = casesPending;
    }

    public Integer getCasesSolved() {
        return casesSolved;
    }

    public void setCasesSolved(Integer casesSolved) {
        this.casesSolved = casesSolved;
    }

    public Double getTrustScore() {
        return trustScore;
    }

    public void setTrustScore(Double trustScore) {
        this.trustScore = trustScore;
    }

    public Double getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(Double successRate) {
        this.successRate = successRate;
    }

    public Double getAverageResolutionTime() {
        return averageResolutionTime;
    }

    public void setAverageResolutionTime(Double averageResolutionTime) {
        this.averageResolutionTime = averageResolutionTime;
    }

    public Integer getNiceValue() {
        return niceValue;
    }

    public void setNiceValue(Integer niceValue) {
        this.niceValue = niceValue;
    }
}
