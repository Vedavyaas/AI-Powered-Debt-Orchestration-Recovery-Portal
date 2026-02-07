package com.iit.fedex.repository;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.iit.fedex.assets.Service;
import com.iit.fedex.assets.Status;
import jakarta.persistence.*;

@Entity
public class DebtCaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonIgnore
    private Long id;

    private String invoiceNumber;
    private String customerName;
    private Double amount;
    private Integer daysOverdue;
    private Service serviceType;
    private Integer pastDefaults;

    @JsonIgnore
    @Enumerated(EnumType.STRING)
    private Status status;
    @JsonIgnore
    private String assignedTo;
    @JsonIgnore
    private Double propensityScore;

    public DebtCaseEntity() {
        this.status = Status.UN_ASSIGNED;
        this.assignedTo = null;
        this.propensityScore = -1.00;
    }

    public DebtCaseEntity(String invoiceNumber, String customerName, Double amount, Integer daysOverdue,  Service serviceType, Integer pastDefaults) {
        this.invoiceNumber = invoiceNumber;
        this.customerName = customerName;
        this.amount = amount;
        this.daysOverdue = daysOverdue;
        this.serviceType = serviceType;
        this.pastDefaults = pastDefaults;
        this.status = Status.UN_ASSIGNED;
        this.assignedTo = null;
        this.propensityScore = -1.00;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
    public Integer getDaysOverdue() {
        return daysOverdue;
    }
    public void setDaysOverdue(Integer daysOverdue) {
        this.daysOverdue = daysOverdue;
    }
    public Service getServiceType() {
        return serviceType;
    }
    public void setServiceType(Service serviceType) {
        this.serviceType = serviceType;
    }
    public Integer getPastDefaults() {
        return pastDefaults;
    }
    public void setPastDefaults(Integer pastDefaults) {
        this.pastDefaults = pastDefaults;
    }

    public Double getPropensityScore() {
        return propensityScore;
    }

    public void setPropensityScore(Double propensityScore) {
        this.propensityScore = propensityScore;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
