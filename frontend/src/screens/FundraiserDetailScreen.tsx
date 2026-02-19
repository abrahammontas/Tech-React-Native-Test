import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  LayoutAnimation,
  Animated,
  useWindowDimensions,
} from 'react-native';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RouteProp, useRoute } from '@react-navigation/native';
import { api } from '../services/api';

type RootStackParamList = {
  FundraiserDetail: { fundraiserId: number };
};

type FundraiserDetailRouteProp = RouteProp<RootStackParamList, 'FundraiserDetail'>;

interface Fundraiser {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  imageUrl: string;
  createdAt: string;
  status: string;
}

const PRESET_AMOUNTS = [10, 25, 50, 100, 250] as const;
const GREEN = '#22c55e';
const GREEN_DARK = '#16a34a';

/** Parses amount string, accepting comma as decimal separator. Returns NaN if invalid. */
function parseAmount(value: string): number {
  const sanitized = value.trim().replace(/,/g, '.');
  return Number.parseFloat(sanitized);
}

/** Single amount button with press scale animation. */
function AmountButton({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: selected ? 1.05 : 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 4,
    }).start();
  }, [selected, scaleAnim]);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scaleAnim, { toValue: selected ? 1.05 : 1, useNativeDriver: true }).start()}
      style={donateStyles.amountBtnWrap}
    >
      <Animated.View
        style={[
          donateStyles.amountBtn,
          selected && donateStyles.amountBtnSelected,
          disabled && donateStyles.amountBtnDisabled,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={[donateStyles.amountBtnText, selected && donateStyles.amountBtnTextSelected]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/** Amount selector with preset buttons and Custom option. */
function AmountSelector({
  selectedAmount,
  customAmount,
  onSelect,
  onCustomChange,
  remainingMax,
  error,
  disabled,
}: {
  selectedAmount: number | 'custom' | null;
  customAmount: string;
  onSelect: (amount: number | 'custom') => void;
  onCustomChange: (value: string) => void;
  remainingMax: number;
  error: string | null;
  disabled: boolean;
}) {
  return (
    <View style={donateStyles.amountSection}>
      <Text style={donateStyles.amountLabel}>Select amount</Text>
      <View style={donateStyles.amountGrid}>
        {PRESET_AMOUNTS.map((amt) => (
          <AmountButton
            key={amt}
            label={`$${amt}`}
            selected={selectedAmount === amt && amt <= remainingMax}
            disabled={disabled || amt > remainingMax}
            onPress={() => amt <= remainingMax && onSelect(amt)}
          />
        ))}
        <AmountButton
          label="Custom"
          selected={selectedAmount === 'custom'}
          disabled={disabled}
          onPress={() => onSelect('custom')}
        />
      </View>
      {selectedAmount === 'custom' && (
        <Animated.View style={donateStyles.customInputWrap}>
          <Text style={donateStyles.inputLabel}>Custom amount</Text>
          <TextInput
            style={[donateStyles.input, error && donateStyles.inputError]}
            placeholder="0.00"
            placeholderTextColor="#94a3b8"
            value={customAmount}
            onChangeText={onCustomChange}
            keyboardType="decimal-pad"
            editable={!disabled}
            autoFocus
          />
        </Animated.View>
      )}
      {error ? <Text style={donateStyles.fieldError}>{error}</Text> : null}
    </View>
  );
}

/** Input with label above (floating label style). */
function DonateInput({
  label,
  value,
  onChangeText,
  error,
  multiline,
  editable,
  inputRef,
  returnKeyType,
  onSubmitEditing,
  ...rest
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  multiline?: boolean;
  editable?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
}) {
  return (
    <View style={donateStyles.inputGroup}>
      <Text style={donateStyles.inputLabel}>{label}</Text>
      <TextInput
        ref={inputRef}
        style={[
          donateStyles.input,
          multiline && donateStyles.inputMultiline,
          error && donateStyles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#94a3b8"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        editable={editable}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...rest}
      />
      {error ? <Text style={donateStyles.fieldError}>{error}</Text> : null}
    </View>
  );
}

/** Donate button with dynamic amount and press animation. */
function DonateButton({
  amount,
  onPress,
  disabled,
  loading,
}: {
  amount: number | null;
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        if (!disabled) Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
      }}
      onPressOut={() => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
      }}
      style={donateStyles.buttonWrap}
    >
      <Animated.View
        style={[
          donateStyles.button,
          disabled && donateStyles.buttonDisabled,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={donateStyles.buttonText}>
          {loading ? 'Submitting...' : amount != null && !Number.isNaN(amount) && amount > 0 ? `Donate $${amount % 1 === 0 ? amount : amount.toFixed(2)} ❤️` : 'Donate'}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/** Parses axios/API errors into user-friendly messages. */
function parseDonationError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Unable to submit donation. Please try again.';
  }
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }
  if (error.response.status === 400) {
    const data = error.response.data as { message?: string; errors?: string[] } | undefined;
    const errors = data?.errors;
    const msg = data?.message;
    if (errors?.length) return errors.join('. ');
    if (msg) return msg;
  }
  return 'Unable to submit donation. Please try again.';
}

/** Celebratory "Goal Reached" card with pulse animation and floating confetti shapes. */
function GoalReachedCard() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const confetti = useRef(
    Array.from({ length: 8 }, () => ({
      opacity: new Animated.Value(1),
      translateY: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
      { iterations: -1 }
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    const loops = confetti.map((anim, i) => {
      const resetAndFall = Animated.sequence([
        Animated.delay(i * 150),
        Animated.parallel([
          Animated.timing(anim.translateY, { toValue: 80, duration: 2500, useNativeDriver: true }),
          Animated.timing(anim.opacity, { toValue: 0, duration: 2500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(anim.translateY, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(anim.opacity, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
      ]);
      const loop = Animated.loop(resetAndFall, { iterations: -1 });
      loop.start();
      return loop;
    });
    return () => loops.forEach((l) => l.stop());
  }, []);

  return (
    <View style={styles.goalReachedSection}>
      <View style={styles.goalReachedCard}>
        {confetti.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confettiShape,
              {
                backgroundColor: ['#4CAF50', '#81C784', '#FFB74D', '#64B5F6', '#F06292'][i % 5],
                left: `${8 + (i % 5) * 20}%`,
                top: -10,
                transform: [{ translateY: anim.translateY }],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}
        <Animated.View style={[styles.goalReachedIconWrap, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.goalReachedIcon}>🎉</Text>
        </Animated.View>
        <Text style={styles.goalReachedTitle}>Goal reached!</Text>
        <Text style={styles.goalReachedSubtitle}>Thanks to everyone who contributed 🎉</Text>
        <View style={styles.goalReachedBadge}>
          <Text style={styles.goalReachedBadgeText}>100% funded ✓</Text>
        </View>
      </View>
    </View>
  );
}

export default function FundraiserDetailScreen() {
  const route = useRoute<FundraiserDetailRouteProp>();
  const { fundraiserId } = route.params;
  const queryClient = useQueryClient();

  const [selectedAmount, setSelectedAmount] = useState<number | 'custom' | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [message, setMessage] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [donorNameError, setDonorNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [donateSuccess, setDonateSuccess] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const formFieldsAnim = useRef(new Animated.Value(0)).current;

  const donorNameRef = useRef<TextInput>(null);
  const messageRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const donationSectionRef = useRef<View>(null);

  const [scrollY, setScrollY] = useState(0);
  const [donationSectionLayout, setDonationSectionLayout] = useState<{ y: number; height: number } | null>(null);
  const { height: viewportHeight } = useWindowDimensions();

  const { data, isLoading, error, refetch: refetchFundraiser, isRefetching: fundraiserRefetching } = useQuery({
    queryKey: ['fundraiser', fundraiserId],
    queryFn: () => api.getFundraiser(fundraiserId),
  });

  const onRefresh = useCallback(() => refetchFundraiser(), [refetchFundraiser]);

  const createDonationMutation = useMutation({
    mutationFn: (payload: { amount: number; donorName: string; message?: string }) =>
      api.createDonation(fundraiserId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fundraiser', fundraiserId] });
      queryClient.invalidateQueries({ queryKey: ['donations', fundraiserId] });
      setSelectedAmount(null);
      setCustomAmount('');
      setDonorName('');
      setMessage('');
      setAmountError(null);
      setDonorNameError(null);
      setSubmitError(null);
      setDonateSuccess(true);
      Keyboard.dismiss();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    },
    onError: (err: unknown) => {
      setSubmitError(parseDonationError(err));
    },
  });

  const fundraiser = data?.data;
  const isGoalReached = fundraiser ? fundraiser.raised >= fundraiser.goal : false;
  const remainingAmount = fundraiser ? Math.max(0, fundraiser.goal - fundraiser.raised) : 0;
  const remainingMax = Math.min(remainingAmount, 100000);

  const resolvedAmount =
    selectedAmount === 'custom'
      ? parseAmount(customAmount)
      : selectedAmount != null
        ? selectedAmount
        : null;
  const hasValidAmount =
    resolvedAmount != null &&
    !Number.isNaN(resolvedAmount) &&
    resolvedAmount > 0 &&
    resolvedAmount <= remainingMax;
  const isDonorNameValid = donorName.trim().length >= 2 && donorName.trim().length <= 100;
  const isFormValid = hasValidAmount && isDonorNameValid;
  const isSubmitDisabled = createDonationMutation.isPending || !isFormValid || isGoalReached;
  const hasAmountSelected = selectedAmount != null;

  const IMAGE_HEIGHT = 300;
  const donationSectionY = donationSectionLayout ? IMAGE_HEIGHT + donationSectionLayout.y : 0;
  const donationSectionBottom = donationSectionLayout ? donationSectionY + donationSectionLayout.height : 0;
  const donationSectionVisible =
    donationSectionLayout != null &&
    scrollY < donationSectionBottom &&
    donationSectionY < scrollY + viewportHeight;
  const showFloatingCta =
    !isGoalReached &&
    !donateSuccess &&
    donationSectionLayout != null &&
    !donationSectionVisible;

  const scrollToDonationSection = useCallback(() => {
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, donationSectionY - 20),
      animated: true,
    });
  }, [donationSectionY]);

  useEffect(() => {
    if (hasAmountSelected) {
      Animated.timing(formFieldsAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      formFieldsAnim.setValue(0);
    }
  }, [hasAmountSelected, formFieldsAnim]);

  const validateAndSubmit = () => {
    setSubmitError(null);
    setAmountError(null);
    setDonorNameError(null);

    if (isGoalReached) {
      setSubmitError('This fundraiser has already reached its goal.');
      return;
    }

    if (resolvedAmount == null || Number.isNaN(resolvedAmount) || resolvedAmount <= 0) {
      setAmountError('Enter a valid positive amount');
      return;
    }
    if (resolvedAmount > remainingMax) {
      setAmountError(`Amount cannot exceed $${remainingMax.toLocaleString()} remaining`);
      return;
    }
    const trimmedName = donorName.trim();
    if (!trimmedName) {
      setDonorNameError('Your name is required');
      return;
    }
    if (trimmedName.length < 2) {
      setDonorNameError('Name must be at least 2 characters');
      return;
    }
    if (trimmedName.length > 100) {
      setDonorNameError('Name must be less than 100 characters');
      return;
    }

    createDonationMutation.mutate({
      amount: resolvedAmount,
      donorName: trimmedName,
      message: message.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error || !fundraiser) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading fundraiser</Text>
      </View>
    );
  }

  const progress = (fundraiser.raised / fundraiser.goal) * 100;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={fundraiserRefetching}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
          />
        }
      >
      <Image source={{ uri: fundraiser.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{fundraiser.title}</Text>
        <View style={styles.descriptionWrap}>
          <Text
            style={styles.description}
            numberOfLines={descriptionExpanded ? undefined : 3}
            ellipsizeMode="tail"
          >
            {fundraiser.description}
          </Text>
          <Pressable
            onPress={() => setDescriptionExpanded((e) => !e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.readMoreText}>
              {descriptionExpanded ? 'Read less' : 'Read more'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.raised}>${fundraiser.raised.toLocaleString()}</Text>
            <Text style={styles.goal}>of ${fundraiser.goal.toLocaleString()} goal</Text>
          </View>
          <Text style={styles.percentage}>{Math.round(progress)}% funded</Text>
        </View>

        {isGoalReached ? (
          <GoalReachedCard />
        ) : donateSuccess ? (
          <View style={donateStyles.successSection}>
            <Text style={donateStyles.successIcon}>🎉</Text>
            <Text style={donateStyles.successTitle}>Donation successful 🎉</Text>
            <Text style={donateStyles.successSubtitle}>Thank you for your support!</Text>
            {/* TODO: Add confetti animation here */}
          </View>
        ) : (
        <View
          ref={donationSectionRef}
          onLayout={(e) =>
            setDonationSectionLayout({
              y: e.nativeEvent.layout.y,
              height: e.nativeEvent.layout.height,
            })
          }
          style={donateStyles.formCard}
        >
          <Text style={donateStyles.formTitle}>Make a Donation</Text>

          <AmountSelector
            selectedAmount={selectedAmount}
            customAmount={customAmount}
            onSelect={(amt) => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setSelectedAmount(amt);
              setAmountError(null);
              setSubmitError(null);
              // Scroll to show full form after fields animate in
              setTimeout(() => scrollToDonationSection(), 350);
            }}
            onCustomChange={(text) => {
              setCustomAmount(text.replace(/,/g, '.'));
              setAmountError(null);
              setSubmitError(null);
              const num = parseAmount(text.replace(/,/g, '.'));
              if (num > 0 && num > remainingMax) setAmountError(`Max $${remainingMax.toLocaleString()} remaining`);
              else setAmountError(null);
            }}
            remainingMax={remainingMax}
            error={amountError}
            disabled={createDonationMutation.isPending}
          />

          {hasAmountSelected && (
            <Animated.View
              style={[
                donateStyles.formFieldsWrap,
                {
                  opacity: formFieldsAnim,
                  transform: [
                    {
                      translateY: formFieldsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [12, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <DonateInput
                label="Name"
                value={donorName}
                onChangeText={(text) => {
                  setDonorName(text);
                  setSubmitError(null);
                  const t = text.trim();
                  setDonorNameError(
                    !t ? 'Your name is required' : t.length < 2 ? 'At least 2 characters' : t.length > 100 ? 'Max 100 characters' : null
                  );
                }}
                autoCapitalize="words"
                error={donorNameError}
                editable={!createDonationMutation.isPending}
                inputRef={donorNameRef}
                returnKeyType="next"
                onSubmitEditing={() => messageRef.current?.focus()}
                autoCapitalize="words"
              />


              <DonateInput
                label="Message (optional)"
                value={message}
                onChangeText={setMessage}
                error={null}
                multiline
                editable={!createDonationMutation.isPending}
                inputRef={messageRef}
                returnKeyType="done"
                onSubmitEditing={validateAndSubmit}
              />

              {submitError ? (
                <Text style={donateStyles.submitError}>{submitError}</Text>
              ) : null}

              <DonateButton
                amount={resolvedAmount}
                onPress={validateAndSubmit}
                disabled={isSubmitDisabled}
                loading={createDonationMutation.isPending}
              />
            </Animated.View>
          )}
        </View>
        )}
      </View>
    </ScrollView>

    {showFloatingCta && (
      <View style={donateStyles.floatingCtaWrap}>
        <Pressable
          style={donateStyles.floatingCta}
          onPress={scrollToDonationSection}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <Text style={donateStyles.floatingCtaText}>Donate</Text>
        </Pressable>
      </View>
    )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#e0e0e0',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  descriptionWrap: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  readMoreText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
    marginTop: 4,
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  raised: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  goal: {
    fontSize: 16,
    color: '#666',
  },
  percentage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  fieldError: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
  },
  successBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  successBannerText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  messageInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorFeedback: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  goalReachedSection: {
    marginBottom: 16,
  },
  goalReachedCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    overflow: 'visible',
  },
  confettiShape: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  goalReachedIconWrap: {
    marginBottom: 12,
  },
  goalReachedIcon: {
    fontSize: 64,
  },
  goalReachedTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  goalReachedSubtitle: {
    fontSize: 16,
    color: '#388E3C',
    textAlign: 'center',
    marginBottom: 16,
  },
  goalReachedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  goalReachedBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

const donateStyles = StyleSheet.create({
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
  },
  formFieldsWrap: {
    marginTop: 4,
  },
  amountSection: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amountBtnWrap: {
    minWidth: '30%',
  },
  amountBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  amountBtnSelected: {
    backgroundColor: GREEN,
    borderColor: GREEN_DARK,
  },
  amountBtnDisabled: {
    opacity: 0.5,
  },
  amountBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  amountBtnTextSelected: {
    color: '#fff',
  },
  customInputWrap: {
    marginTop: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#fff',
  },
  inputMultiline: {
    minHeight: 88,
    paddingTop: 14,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  fieldError: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 6,
  },
  submitError: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 12,
  },
  buttonWrap: {
    marginTop: 8,
  },
  button: {
    backgroundColor: GREEN,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  successSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GREEN,
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#15803d',
  },
  floatingCtaWrap: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  floatingCta: {
    backgroundColor: GREEN,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingCtaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});

