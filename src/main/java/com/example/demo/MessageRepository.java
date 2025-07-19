package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Find all messages that contain a specific keyword
    List<Message> findByMessageContaining(String keyword);

    // Optional: Find all deleted messages (where Deleted = 1)
    List<Message> findByDeleted(Integer deleted);

    // Optional: Find all edited messages (where Edited = 1)
    List<Message> findByEdited(Integer edited);
    
    // Fetch fileData, fileName, and contentType by id
    @Query("SELECT m.fileData, m.fileName, m.contentType FROM Message m WHERE m.id = :id")
    fileData findFileDataById(Long id);

    // Fetch fileData, fileName, and contentType by senderEmail
    @Query("SELECT m.fileData, m.fileName, m.contentType FROM Message m WHERE m.senderEmail = :senderEmail")
    Optional<Object[]> findFileDataBySenderEmail(String senderEmail);

    // Fetch fileData, fileName, and contentType by receiverEmail
    @Query("SELECT m.fileData, m.fileName, m.contentType FROM Message m WHERE m.receiverEmail = :receiverEmail")
    Optional<Object[]> findFileDataByReceiverEmail(String receiverEmail);
    
    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.message = :newMessage, m.fileData = NULL, m.fileName = NULL, m.contentType = NULL, m.deleted = 1 WHERE m.id = :id")
    void clearFileDataAndMarkAsDeleted(Long id,@Param("newMessage") String newMessage);
    

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.message = :newMessage, m.edited = 1 WHERE m.id = :id")
    void updateMessageById(@Param("id") Long id, @Param("newMessage") String newMessage);
    
//    @Query(value = "SELECT id, sender_email AS senderEmail, receiver_email AS receiverEmail, " +
//            "message, file_name AS fileName, content_type AS contentType, " +
//            "date, edited, deleted " +
//            "FROM message " +
//            "WHERE (sender_email = :senderEmail AND receiver_email = :receiverEmail) " +
//            "   OR (sender_email = :receiverEmail AND receiver_email = :senderEmail) " +
//            "ORDER BY id",
//    nativeQuery = true)
    
    @Query("""
            SELECT m.id AS id, 
                   m.senderEmail AS senderEmail, 
                   m.receiverEmail AS receiverEmail, 
                   m.message AS message, 
                   m.fileName AS fileName, 
                   m.contentType AS contentType, 
                   m.date AS date, 
                   m.edited AS edited, 
                   m.deleted AS deleted
            FROM Message m
            WHERE (m.senderEmail = :senderEmail AND m.receiverEmail = :receiverEmail)
               OR (m.senderEmail = :receiverEmail AND m.receiverEmail = :senderEmail)
            ORDER BY m.id
    """)
    List<MessageView> findMessagesBySenderAndReceiver(
            @Param("senderEmail") String senderEmail,
            @Param("receiverEmail") String receiverEmail
    );
    
    
//    @Autowired
//    private JdbcTemplate jdbcTemplate;
//    
//    public List<MessageView> findMessagesBySenderAndReceiver(String senderEmail, String receiverEmail) {
//        String sql = """
//            SELECT id, sender_email AS senderEmail, receiver_email AS receiverEmail,
//                   message, file_name AS fileName, content_type AS contentType,
//                   date, edited, deleted
//            FROM message
//            WHERE (sender_email = ? AND receiver_email = ?)
//               OR (sender_email = ? AND receiver_email = ?)
//            ORDER BY id
//            """;
//
//        return jdbcTemplate.query(
//            sql,
//            new BeanPropertyRowMapper<>(MessageView.class),
//            senderEmail, receiverEmail, receiverEmail, senderEmail
//        );
//    }
    
//    List<MessageView> messages = jdbcTemplate.query(
//    	    sql,
//    	    new Object[]{senderEmail, receiverEmail, receiverEmail, senderEmail},
//    	    new BeanPropertyRowMapper<>(MessageView.class)
//    	);

//    return jdbcTemplate.query(
//    	    sql,
//    	    new Object[]{senderEmail, receiverEmail, receiverEmail, senderEmail},
//    	    new BeanPropertyRowMapper<>(MessageView.class)
//    	);
    
    
//    @Autowired
//    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;
//
//    public List<MessageView> findMessages(...) {
//        String sql = """
//            SELECT id, sender_email AS senderEmail, receiver_email AS receiverEmail,
//                   message, file_name AS fileName, content_type AS contentType,
//                   date, edited, deleted
//            FROM message
//            WHERE (sender_email = :senderEmail AND receiver_email = :receiverEmail)
//               OR (sender_email = :receiverEmail AND receiver_email = :senderEmail)
//               OR (sender_email = :senderEmail AND phone = :phone)
//               OR (sender_email = :senderEmail AND age = :age)
//            ORDER BY id
//        """;
//
//        Map<String, Object> params = new HashMap<>();
//        params.put("senderEmail", senderEmail);
//        params.put("receiverEmail", receiverEmail);
//        params.put("phone", phone);
//        params.put("age", age);
//
//        return namedParameterJdbcTemplate.query(
//            sql,
//            params,
//            new BeanPropertyRowMapper<>(MessageView.class)
//        );
//    }
//

    
}
