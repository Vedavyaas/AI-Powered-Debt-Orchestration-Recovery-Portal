package com.iit.fedex.service;

import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import com.iit.fedex.assets.Role;
import com.iit.fedex.assets.Status;
import com.iit.fedex.dto.AdminAssignment;
import com.iit.fedex.repository.DebtCaseEntity;
import com.iit.fedex.repository.DebtCaseRepository;
import com.iit.fedex.repository.JWTLoginEntity;
import com.iit.fedex.repository.JWTLoginRepository;
import jakarta.transaction.Transactional;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class CSVService {

    private final JWTLoginRepository jwtLoginRepository;
    private final DebtCaseRepository debtCaseRepository;
    private final JavaMailSenderImpl mailSender;

    public CSVService(JWTLoginRepository jwtLoginRepository, DebtCaseRepository debtCaseRepository, JavaMailSenderImpl mailSender) {
        this.jwtLoginRepository = jwtLoginRepository;
        this.debtCaseRepository = debtCaseRepository;
        this.mailSender = mailSender;
    }

    public String putCSV(String user, MultipartFile multipartFile) {
        Optional<JWTLoginEntity> jwtLoginEntity = jwtLoginRepository.findByEmail(user);
        if(jwtLoginEntity.isPresent()){
            if(jwtLoginEntity.get().getRole().equals(Role.FEDEX_ADMIN)){
                CsvMapper mapper = new CsvMapper();
                CsvSchema schema = CsvSchema.emptySchema().withHeader();

                try (MappingIterator<DebtCaseEntity> it = mapper
                        .readerFor(DebtCaseEntity.class)
                        .with(schema)
                        .readValues(multipartFile.getInputStream())) {

                    List<DebtCaseEntity> cases = it.readAll();
                    debtCaseRepository.saveAll(cases);
                } catch (IOException e) {
                    return "Error while reading file";
                }

                return "Uploaded successfully!";
            }
            return "You dont have enough permissions to do this action";
        }
        return "Invalid user";
    }

    @Transactional
    public String assign(String user, AdminAssignment adminAssignment) {
        Optional<JWTLoginEntity> jwtLoginEntity = jwtLoginRepository.findByEmail(user);
        if(jwtLoginEntity.isPresent()){
            if(jwtLoginEntity.get().getRole().equals(Role.FEDEX_ADMIN)){
                List<String> invoiceNumbers = adminAssignment.invoiceNumber();
                invoiceNumbers.forEach(invoiceNumber -> {
                    debtCaseRepository.updateAssignedToAndStatusByInvoiceNumber(adminAssignment.agencyID(), Status.ASSIGNED, invoiceNumber);
                    sendMailToDCAManager(adminAssignment.agencyID());
                });
                return "Successfully assigned to " + adminAssignment.agencyID();
            }
            return "You dont have enough permissions to do this action";
        }
        return "Invalid user";
    }

    private void sendMailToDCAManager(String ID) {
        List<JWTLoginEntity> DCAManagers = jwtLoginRepository.findAllByAgencyIdAndRole(ID, Role.DCA_MANAGER);
        DCAManagers.forEach(DCAManager -> {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(DCAManager.getEmail());
            mailMessage.setSubject("Action required : New cases assigned");
            mailMessage.setText("""
                    Hello,
                    You have been assigned new debt recovery cases within the PHEONIX system.
                    Please log in to your dashboard to review the case details, check the customer profiles, and begin the outreach process.
                    All updates and call logs must be recorded directly in the portal for compliance.
                    Regards,
                    FedEx System Administrator""");
            mailSender.send(mailMessage);
        });
    }

    public List<DebtCaseEntity> getCSV(String user) {
        Optional<JWTLoginEntity> jwtLoginEntity = jwtLoginRepository.findByEmail(user);
        if(jwtLoginEntity.isPresent()){
            if(jwtLoginEntity.get().getRole().equals(Role.FEDEX_ADMIN)){
                return debtCaseRepository.findAll();
            }
            return null;
        }
        return null;
    }
}
