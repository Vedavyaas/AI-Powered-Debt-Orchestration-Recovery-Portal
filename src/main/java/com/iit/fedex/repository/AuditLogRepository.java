package com.iit.fedex.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, Long> {

    List<AuditLogEntity> findByUserEmailOrderByTimestampDesc(String userEmail);
    
    List<AuditLogEntity> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, String entityId);
    
    Page<AuditLogEntity> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime start, LocalDateTime end, Pageable pageable);
    
    List<AuditLogEntity> findByActionAndTimestampAfter(String action, LocalDateTime timestamp);
    
    @Query("SELECT a FROM AuditLogEntity a WHERE a.userEmail = :userEmail AND a.timestamp >= :since ORDER BY a.timestamp DESC")
    List<AuditLogEntity> findRecentByUser(@Param("userEmail") String userEmail, 
                                          @Param("since") LocalDateTime since);
    
    @Query("SELECT a.action, COUNT(a) FROM AuditLogEntity a WHERE a.timestamp >= :since GROUP BY a.action")
    List<Object[]> countActionsSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT a.entityType, COUNT(a) FROM AuditLogEntity a WHERE a.timestamp >= :since GROUP BY a.entityType")
    List<Object[]> countByEntityTypeSince(@Param("since") LocalDateTime since);
}

