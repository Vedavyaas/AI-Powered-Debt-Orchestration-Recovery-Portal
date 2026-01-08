package com.iit.fedex.config;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessagePreparator;

import java.io.InputStream;
import java.util.Properties;

@Configuration
public class MailConfig {

    /**
     * Fallback mail sender so the application can start even when SMTP settings are not configured.
     *
     * NOTE: This intentionally does nothing (no-op). Mail/OTP features that rely on email delivery
     * will not function until a real JavaMailSender is configured.
     */
    @Bean
    @ConditionalOnMissingBean(JavaMailSender.class)
    public JavaMailSender noOpJavaMailSender() {
        return new NoOpJavaMailSender();
    }

    private static final class NoOpJavaMailSender implements JavaMailSender {

        @Override
        public MimeMessage createMimeMessage() {
            return new MimeMessage(Session.getDefaultInstance(new Properties()));
        }

        @Override
        public MimeMessage createMimeMessage(InputStream contentStream) {
            try {
                return new MimeMessage(Session.getDefaultInstance(new Properties()), contentStream);
            } catch (Exception e) {
                return createMimeMessage();
            }
        }

        @Override
        public void send(MimeMessage mimeMessage) {
            // no-op
        }

        @Override
        public void send(MimeMessage... mimeMessages) {
            // no-op
        }

        @Override
        public void send(MimeMessagePreparator mimeMessagePreparator) {
            // no-op
        }

        @Override
        public void send(MimeMessagePreparator... mimeMessagePreparators) {
            // no-op
        }

        @Override
        public void send(SimpleMailMessage simpleMessage) {
            // no-op
        }

        @Override
        public void send(SimpleMailMessage... simpleMessages) {
            // no-op
        }
    }
}
