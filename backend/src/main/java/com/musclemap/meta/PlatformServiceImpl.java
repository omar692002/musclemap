package com.musclemap.meta;

import com.musclemap.config.MuscleMapProperties;
import com.musclemap.subscription.SubscriptionPlan;
import com.musclemap.user.Role;
import com.musclemap.user.TrainingGoal;
import com.musclemap.user.UserRepository;
import com.musclemap.workout.SplitType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/**
 * Aggregates platform metadata. Demonstrates the Controller -> Service -> Repository
 * flow end to end: the {@code totalUsers} figure is read through {@link UserRepository}.
 */
@Service
public class PlatformServiceImpl implements PlatformService {

    private final MuscleMapProperties properties;
    private final UserRepository userRepository;

    public PlatformServiceImpl(MuscleMapProperties properties, UserRepository userRepository) {
        this.properties = properties;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PlatformInfoResponse describe() {
        MuscleMapProperties.App app = properties.getApp();
        return new PlatformInfoResponse(
                app.name(),
                app.version(),
                app.milestone(),
                names(Role.values()),
                names(TrainingGoal.values()),
                names(SplitType.values()),
                names(SubscriptionPlan.values()),
                userRepository.count()
        );
    }

    private static List<String> names(Enum<?>[] values) {
        return Arrays.stream(values).map(Enum::name).toList();
    }
}
