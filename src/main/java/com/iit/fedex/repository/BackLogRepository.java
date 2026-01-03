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
public interface BackLogRepository extends JpaRepository<BackLogEntity, Long> {

    List<BackLogEntity> findByPerformedByOrderByTimestampDesc(String performedBy);

    List<BackLogEntity> findByModuleOrderByTimestampDesc(String module);

    List<BackLogEntity> findByActionOrderByTimestampDesc(String action);

    List<BackLogEntity> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, String entityId);

    Page<BackLogEntity> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<BackLogEntity> findBySuccessOrderByTimestampDesc(Boolean success, Pageable pageable);

    @Query("SELECT b FROM BackLogEntity b WHERE b.performedBy = :userEmail " +
           "AND b.timestamp >= :since ORDER BY b.timestamp DESC")
    List<BackLogEntity> findRecentByUser(@Param("userEmail") String userEmail,
                                          @Param("since") LocalDateTime since);

    @Query("SELECT b.module, COUNT(b) FROM BackLogEntity b " +
           "WHERE b.timestamp >= :since GROUP BY b.module")
    List<Object[]> countByModuleSince(@Param("since") LocalDateTime since);

    @Query("SELECT b.action, COUNT(b) FROM BackLogEntity b " +
           "WHERE b.timestamp >= :since GROUP BY b.action")
    List<Object[]> countActionsSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(b) FROM BackLogEntity b WHERE b.timestamp >= :since")
    Long countTotalSince(@Param("since") LocalDateTime since);

    @Query("SELECT b FROM BackLogEntity b WHERE " +
           "(:module IS NULL OR b.module = :module) AND " +
           "(:action IS NULL OR b.action = :action) AND " +
           "(:userEmail IS NULL OR b.performedBy = :userEmail) AND " +
           "b.timestamp BETWEEN :start AND :end " +
           "ORDER BY b.timestamp DESC")
    Page<BackLogEntity> searchBackLogs(
            @Param("module") String module,
            @Param("action") String action,
            @Param("userEmail") String userEmail,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable);
}

