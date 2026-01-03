package com.iit.fedex.aspect;

import java.lang.annotation.*;

/**
 * Annotation to mark methods for automatic action tracking
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface TrackAction {

    /**
     * The action name (e.g., "CREATE_USER", "UPDATE_CASE", "LOGIN")
     */
    String action();

    /**
     * The module name (e.g., "UserController", "DebtService", "Auth")
     */
    String module();

    /**
     * Description of the action
     */
    String description() default "";

    /**
     * Whether to log the request body (be careful with sensitive data)
     */
    boolean logRequest() default true;

    /**
     * Whether to log the response
     */
    boolean logResponse() default false;

    /**
     * Entity type for correlation (e.g., "USER", "DEBT_CASE")
     */
    String entityType() default "";

    /**
     * Parameter name that contains the entity ID (SpEL expression)
     */
    String entityIdParam() default "";
}

