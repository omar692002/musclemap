package com.musclemap.bodyweight;

import com.musclemap.bodyweight.dto.BodyweightRequest;
import com.musclemap.bodyweight.dto.BodyweightResponse;
import com.musclemap.common.exception.ResourceNotFoundException;
import com.musclemap.user.User;
import com.musclemap.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Default {@link BodyweightService}. A weigh-in is keyed by (user, day): logging
 * again on the same day updates the existing entry rather than stacking points,
 * so the trend chart stays one-per-day. Ownership is enforced on delete (a
 * mismatch surfaces as 404, never leaking another user's ids).
 */
@Service
public class BodyweightServiceImpl implements BodyweightService {

    private final BodyweightEntryRepository entryRepository;
    private final UserRepository userRepository;

    public BodyweightServiceImpl(BodyweightEntryRepository entryRepository,
                                 UserRepository userRepository) {
        this.entryRepository = entryRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public BodyweightResponse log(UUID userId, BodyweightRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        LocalDate recordedOn = request.recordedOn() != null ? request.recordedOn() : LocalDate.now();

        BodyweightEntry entry = entryRepository.findByUserIdAndRecordedOn(userId, recordedOn)
                .orElseGet(() -> {
                    BodyweightEntry fresh = new BodyweightEntry();
                    fresh.setUser(user);
                    fresh.setRecordedOn(recordedOn);
                    return fresh;
                });
        entry.setWeightKg(request.weightKg());
        entry.setNote(request.note());

        return BodyweightResponse.from(entryRepository.save(entry));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BodyweightResponse> listForUser(UUID userId) {
        return entryRepository.findByUserIdOrderByRecordedOnAsc(userId).stream()
                .map(BodyweightResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public void deleteForUser(UUID userId, UUID entryId) {
        BodyweightEntry entry = entryRepository.findById(entryId)
                .orElseThrow(() -> ResourceNotFoundException.of("BodyweightEntry", entryId));
        if (!entry.getUser().getId().equals(userId)) {
            // Don't reveal that the id exists for another user.
            throw ResourceNotFoundException.of("BodyweightEntry", entryId);
        }
        entryRepository.delete(entry);
    }
}
