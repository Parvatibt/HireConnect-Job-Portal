package com.example.springapp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.Map;

/**
 * Logs registered request mappings at startup.
 * Uses the primary servlet RequestMappingHandlerMapping bean (requestMappingHandlerMapping)
 * to avoid picking up actuator/controllerEndpointHandlerMapping.
 */
@Component
public class MappingLogger {

    private static final Logger log = LoggerFactory.getLogger(MappingLogger.class);

    private final RequestMappingHandlerMapping mapping;

    public MappingLogger(@Qualifier("requestMappingHandlerMapping") RequestMappingHandlerMapping mapping) {
        this.mapping = mapping;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void logMappings() {
        Map<RequestMappingInfo, ?> map = mapping.getHandlerMethods();
        log.info("Registered request mappings (total={}):", map.size());
        map.forEach((info, method) -> log.info("{} -> {}", info, method));
    }
}
