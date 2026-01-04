package com.iit.fedex.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Forward SPA client routes to index.html so deep-links work.
        // API endpoints are NOT included here.
        registry.addViewController("/").setViewName("forward:/index.html");

        registry.addViewController("/home/**").setViewName("forward:/index.html");
        registry.addViewController("/users/**").setViewName("forward:/index.html");
        registry.addViewController("/debt-search/**").setViewName("forward:/index.html");
        registry.addViewController("/ai/**").setViewName("forward:/index.html");
        registry.addViewController("/csv-upload/**").setViewName("forward:/index.html");
        registry.addViewController("/reports/**").setViewName("forward:/index.html");
        registry.addViewController("/export/**").setViewName("forward:/index.html");
        registry.addViewController("/audit/**").setViewName("forward:/index.html");
        registry.addViewController("/dashboard/**").setViewName("forward:/index.html");
        registry.addViewController("/profile/**").setViewName("forward:/index.html");
        registry.addViewController("/my-debts/**").setViewName("forward:/index.html");
        registry.addViewController("/agents/**").setViewName("forward:/index.html");
        registry.addViewController("/action/**").setViewName("forward:/index.html");
        registry.addViewController("/login/**").setViewName("forward:/index.html");

        registry.addViewController("/signup/**").setViewName("forward:/index.html");
        registry.addViewController("/forgot-password/**").setViewName("forward:/index.html");
    }
}
