package com.iit.fedex.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iit.fedex.repository.BackLogEntity;
import com.iit.fedex.repository.BackLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * AOP Aspect that automatically tracks all actions performed in controllers
 */
@Aspect
@Component
public class ActionTrackingAspect {

    private static final Logger logger = LoggerFactory.getLogger(ActionTrackingAspect.class);
    
    private final BackLogRepository backLogRepository;
    private final ObjectMapper objectMapper;

    public ActionTrackingAspect(BackLogRepository backLogRepository, ObjectMapper objectMapper) {
        this.backLogRepository = backLogRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Pointcut for all controller methods
     */
    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *) || " +
              "within(@org.springframework.stereotype.Controller *)")
    public void controllerPointcut() {}

    /**
     * Pointcut for methods annotated with @TrackAction
     */
    @Pointcut("@annotation(com.iit.fedex.aspect.TrackAction)")
    public void trackActionPointcut() {}

    /**
     * Pointcut for all public methods in controllers
     */
    @Pointcut("execution(public * *..controller.*.*(..))")
    public void publicMethodPointcut() {}

    /**
     * Around advice for methods annotated with @TrackAction
     */
    @Around("trackActionPointcut()")
    public Object trackAnnotatedMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        return trackMethod(joinPoint, true);
    }

    /**
     * Around advice for all controller public methods (logs everything)
     */
    @Around("controllerPointcut() && publicMethodPointcut()")
    public Object trackAllControllerMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return trackMethod(joinPoint, false);
    }

    private Object trackMethod(ProceedingJoinPoint joinPoint, boolean isAnnotated) throws Throwable {
        long startTime = System.currentTimeMillis();
        BackLogEntity backLog = new BackLogEntity();
        Object result = null;
        boolean success = true;
        String errorMessage = null;

        try {
            // Set basic info
            backLog.setTimestamp(LocalDateTime.now());
            backLog.setDurationMs(0L);
            backLog.setSuccess(true);

            // Get method details
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            String actionName = method.getName();
            String className = method.getDeclaringClass().getSimpleName();

            // Check for @TrackAction annotation
            TrackAction annotation = method.getAnnotation(TrackAction.class);
            if (annotation != null) {
                backLog.setAction(annotation.action());
                backLog.setModule(annotation.module());
                backLog.setDescription(annotation.description());
                backLog.setEntityType(annotation.entityType());
            } else {
                // Generate action name from method name
                backLog.setAction(formatActionName(actionName));
                backLog.setModule(className.replace("Controller", ""));
                backLog.setDescription(method.getName() + " called");
            }

            // Get HTTP request info
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                backLog.setHttpMethod(request.getMethod());
                backLog.setEndpoint(request.getRequestURI());
                backLog.setIpAddress(getClientIpAddress(request));
                backLog.setUserAgent(request.getHeader("User-Agent"));
            }

            // Get user info
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                backLog.setPerformedBy(auth.getName());
            } else {
                backLog.setPerformedBy("ANONYMOUS");
            }

            // Extract entity ID if specified in annotation
            if (annotation != null && !annotation.entityIdParam().isEmpty()) {
                String entityId = extractEntityId(joinPoint, annotation.entityIdParam());
                backLog.setEntityId(entityId);
            }

            // Log request data
            if (annotation == null || annotation.logRequest()) {
                String requestData = extractRequestData(joinPoint);
                backLog.setRequestData(sanitizeData(requestData));
            }

            // Execute the method
            result = joinPoint.proceed();

            // Log response if needed
            if (annotation != null && annotation.logResponse()) {
                String responseData = sanitizeData(serializeObject(result));
                backLog.setResponseData(truncateIfNeeded(responseData, 2000));
            }

        } catch (Exception e) {
            success = false;
            errorMessage = e.getMessage();
            backLog.setSuccess(false);
            backLog.setErrorMessage(truncateIfNeeded(errorMessage, 500));
            throw e;
        } finally {
            // Calculate duration
            long duration = System.currentTimeMillis() - startTime;
            backLog.setDurationMs(duration);
        }

        // Save the log
        try {
            backLogRepository.save(backLog);
        } catch (Exception e) {
//            logger.error("Failed to save backlog entry: {}", e.getMessage());
        }

        return result;
    }

    private String formatActionName(String methodName) {
        // Convert camelCase to UPPER_SNAKE_CASE
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < methodName.length(); i++) {
            char c = methodName.charAt(i);
            if (Character.isUpperCase(c)) {
                if (i > 0) result.append('_');
                result.append(c);
            } else {
                result.append(Character.toUpperCase(c));
            }
        }
        return result.toString();
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String extractRequestData(ProceedingJoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args == null || args.length == 0) {
                return null;
            }

            Map<String, Object> requestMap = new HashMap<>();
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Parameter[] parameters = signature.getMethod().getParameters();
            String[] parameterNames = signature.getParameterNames();

            for (int i = 0; i < parameters.length; i++) {
                if (i < parameterNames.length && args[i] != null) {
                    // Skip request and response objects
                    String typeName = parameters[i].getType().getSimpleName();
                    if (!typeName.contains("HttpServletRequest") && 
                        !typeName.contains("HttpServletResponse") &&
                        !typeName.contains("BindingResult")) {
                        requestMap.put(parameterNames[i], sanitizeValue(args[i]));
                    }
                }
            }

            return objectMapper.writeValueAsString(requestMap);
        } catch (Exception e) {
            return "Unable to serialize request data";
        }
    }

    private Object sanitizeValue(Object value) {
        if (value == null) {
            return null;
        }
        
        String className = value.getClass().getSimpleName();
        
        // Mask sensitive fields
        if (className.contains("LoginRequest") || 
            className.contains("PasswordReset") ||
            className.contains("ChangePassword")) {
            Map<String, Object> masked = new HashMap<>();
            masked.put("***", "***");
            return masked;
        }
        
        return value;
    }

    private String sanitizeData(String data) {
        if (data == null) {
            return null;
        }
        
        // Basic sanitization - truncate long payloads
        return truncateIfNeeded(data, 2000);
    }

    private String truncateIfNeeded(String data, int maxLength) {
        if (data == null) {
            return null;
        }
        if (data.length() <= maxLength) {
            return data;
        }
        return data.substring(0, maxLength) + "... [TRUNCATED]";
    }

    private String serializeObject(Object obj) {
        if (obj == null) {
            return "null";
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "Unable to serialize response";
        }
    }

    private String extractEntityId(ProceedingJoinPoint joinPoint, String paramName) {
        try {
            Object[] args = joinPoint.getArgs();
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            String[] parameterNames = signature.getParameterNames();

            for (int i = 0; i < parameterNames.length; i++) {
                if (parameterNames[i].equals(paramName) && args[i] != null) {
                    return args[i].toString();
                }
            }
        } catch (Exception e) {
//            logger.debug("Could not extract entity ID: {}", e.getMessage());
        }
        return null;
    }
}

