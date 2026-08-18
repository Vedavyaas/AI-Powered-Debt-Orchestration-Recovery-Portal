package com.vedavyaas.orchestration.service;

import com.vedavyaas.orchestration.model.*;
import com.vedavyaas.orchestration.repository.*;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.nio.DoubleBuffer;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DebtService {

    private static final Logger logger = LoggerFactory.getLogger(DebtService.class);
    private final DebtRepository debtRepository;
    private final ManagerRepository managerRepository;
    private final CustomerRepository customerRepository;

    public DebtService(DebtRepository debtRepository, ManagerRepository managerRepository, CustomerRepository customerRepository) {
        this.debtRepository = debtRepository;
        this.managerRepository = managerRepository;
        this.customerRepository = customerRepository;
    }

    public String createDebt(DebtDetails debtDetails, String managerName) {
        Optional<ManagerEntity> managerEntity = managerRepository.findByManagerName(managerName);

        if (managerEntity.isEmpty()) {
            ManagerEntity managerEntity1 = new ManagerEntity(managerName);
            managerRepository.save(managerEntity1);
            logger.info("New Manager : {} recorded.", managerName);

            managerEntity = Optional.of(managerEntity1);
        }

        if (debtRepository.existsByDebtName(debtDetails.debtName())) {
            logger.warn("Manager : {}, tried to create duplicate debt : {}", managerName, debtDetails.debtName());
            throw new InvalidCredentialsException("Debt name already exists.");
        }

        Optional<CustomerEntity> customerEntity = customerRepository.findById(debtDetails.customerId());

        if (customerEntity.isEmpty()) {
            logger.warn("Manager : {}, tried to access invalid customer.", managerName);
            throw new InvalidCredentialsException("No customer found.");
        }

        DebtEntity debtEntity = new DebtEntity(debtDetails.debtName(), customerEntity.get(), managerEntity.get(), debtDetails.principalAmount(), debtDetails.outStandingAmount(), debtDetails.dueDate(), debtDetails.status());
        debtRepository.save(debtEntity);

        logger.info("Manager : {}, created a new debt successfully.", managerName);

        return "Creation successful.";
    }

    public Page<DebtDTO> getAllDebts(Integer pageStart, Integer pageSize, String managerName) {
        Pageable pageable = PageRequest.of(pageStart, pageSize);

        Page<DebtDTO> debtEntities = debtRepository.findByManagerName_ManagerName(managerName, pageable);

        logger.info("Manager : {}, fetched debt info.", managerName);
        return debtEntities;
    }

    public String createCustomer(CustomerDetails customerDetails, String managerName) {
        Optional<CustomerEntity> customerEntity = customerRepository.findByNameOrEmail(customerDetails.name(), customerDetails.email());

        if (customerEntity.isPresent()) {
            logger.warn("Manager : {}, tried to create duplicate customer.", managerName);
            throw new InvalidCredentialsException("Customer with name/email already found.");
        }

        Optional<ManagerEntity> managerEntity = managerRepository.findByManagerName(managerName);
        if (managerEntity.isEmpty()) {
            ManagerEntity managerEntity1 = new ManagerEntity(managerName);
            managerRepository.save(managerEntity1);
            logger.info("New Manager : {} recorded in createCustomer.", managerName);
            managerEntity = Optional.of(managerEntity1);
        }

        CustomerEntity customerEntity1 = new CustomerEntity(customerDetails.name(), customerDetails.phoneNumber(), customerDetails.email(), managerEntity.get());
        customerRepository.save(customerEntity1);

        logger.info("Manager : {}, created customer.", managerName);

        return "Customer created successfully.";
    }

    public Page<CustomerDTO> getCustomerInfo(Integer pageStart, Integer pageSize, String managerName) {
        Optional<ManagerEntity> managerEntity = managerRepository.findByManagerName(managerName);

        if (managerEntity.isEmpty()) {
            return Page.empty();
        }

        Pageable pageable = PageRequest.of(pageStart, pageSize);
        Page<CustomerEntity> customerEntities = customerRepository.findByManager_ManagerName(managerName, pageable);

        return customerEntities.map(customer ->
                new CustomerDTO(
                       customer.getId(),
                       customer.getName(),
                       customer.getPhoneNumber(),
                       customer.getEmail(),
                       managerName
                )
        );
    }

    public String bulkIngestion(MultipartFile multipartFile, String managerName) {
        Optional<ManagerEntity> managerEntity = managerRepository.findByManagerName(managerName);

        if (managerEntity.isEmpty()) {
            ManagerEntity managerEntity1 = new ManagerEntity(managerName);
            managerRepository.save(managerEntity1);
            managerEntity = Optional.of(managerEntity1);
        }

        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(multipartFile.getInputStream(), "UTF-8"));
             CSVParser csvParser = new CSVParser(fileReader,
                     CSVFormat.DEFAULT.builder().setHeader().setIgnoreHeaderCase(true).setTrim(true).build())) {

            List<DebtEntity> products = new ArrayList<>();
            Iterable<CSVRecord> csvRecords = csvParser.getRecords();

            //debt_name, customer_name, customer_email, customer_phone_number, principal_amount, outstanding_amount, due_date, status
            for (CSVRecord csvRecord : csvRecords) {
                DebtEntity product = new DebtEntity(
                        checkDuplicate(csvRecord.get("debt_name")),
                        getCustomerEntity(
                                csvRecord.get("customer_name"),
                                csvRecord.get("customer_email"),
                                csvRecord.get("customer_phone_number"),
                                managerEntity.get()),
                        managerEntity.get(),
                        Double.parseDouble(csvRecord.get("principal_amount")),
                        Double.parseDouble(csvRecord.get("outstanding_amount")),
                        Date.valueOf(csvRecord.get("due_date")),
                        Status.valueOf(csvRecord.get("status"))
                );
                products.add(product);
            }
            debtRepository.saveAll(products);

            logger.info("Manager : {}, done bulk ingeston of debt.", managerName);
            return "Saved successfully.";
        } catch (UnsupportedEncodingException e) {
            throw new InvalidCredentialsException("Invalid format of data.");
        } catch (IOException e) {
            throw new InvalidCredentialsException("Some error occurred.");
        }
    }

    private String checkDuplicate(String debtName) throws UnsupportedEncodingException{
        if (debtRepository.existsByDebtName(debtName)) throw new UnsupportedEncodingException();
        return debtName;
    }

    private CustomerEntity getCustomerEntity(String customerName, String customerEmail, String customerPhoneNumber, ManagerEntity managerEntity) {
        Optional<CustomerEntity> customerEntity = customerRepository.findByNameOrEmail(customerName, customerEmail);

        if (customerEntity.isEmpty()) {
            CustomerEntity customerEntity1 = new CustomerEntity(customerName, customerPhoneNumber, customerEmail, managerEntity);
            customerRepository.save(customerEntity1);

            return customerEntity1;
        }

        return customerEntity.get();

    }
}