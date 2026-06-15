import { useRouter } from 'expo-router';



import { useCallback, useEffect, useMemo, useRef, useState } from 'react';



import { StyleSheet, View } from 'react-native';



import { AppText } from '@/components/AppText';

import { AboutYouStep } from '@/components/onboarding/AboutYouStep';

import { AccountStep } from '@/components/onboarding/AccountStep';

import { CompleteStep } from '@/components/onboarding/CompleteStep';

import { EmailConfirmationStep } from '@/components/onboarding/EmailConfirmationStep';

import { HumanLoadingOverlay } from '@/components/onboarding/HumanLoadingOverlay';

import { IntroStep } from '@/components/onboarding/IntroStep';

import { PricingStep } from '@/components/onboarding/PricingStep';

import { ServicesStep } from '@/components/onboarding/ServicesStep';

import { WorkAreaStep } from '@/components/onboarding/WorkAreaStep';

import { useAuth } from '@/contexts/AuthContext';

import { getOnboardingProgress, OnboardingPhase } from '@/constants/onboarding';

import { Colors } from '@/constants/colors';

import { Design } from '@/constants/design';

import { supabase } from '@/lib/supabaseClient';

import { createProfessionalProfile } from '@/services/proRegistrationService';

import { isEmailAlreadyRegistered } from '@/services/emailAvailabilityService';

import { isPhoneAlreadyRegistered } from '@/services/phoneAvailabilityService';

import { savePendingRegistration } from '@/services/pendingRegistrationStorage';

import { OnboardingAccountKind, SelectedOnboardingService, ServicePriceDraft } from '@/types/onboarding';

import {

  validateOnboardingAccount,

  validateOnboardingStep1,

  validateOnboardingStep2,

  validateOnboardingStep3,

  validateOnboardingStep4Fields,

  hasOnboardingStep4Errors,

  buildOnboardingDisplayName,

} from '@/utils/onboardingValidation';

import { parseServicePrices, ServicePriceInput } from '@/utils/pricing';

import { slugifyServiceTitle } from '@/utils/serviceSlug';

import { isValidEmail } from '@/utils/registrationValidation';

import { isValidPhoneForAvailabilityCheck } from '@/utils/phoneUtils';



function devLogRegister(label: string, payload: unknown) {

  if (__DEV__) {

    console.log(`[Fidati Pro Register] ${label}`, payload);

  }

}



function buildServicePriceInputs(

  selectedServices: SelectedOnboardingService[],

  servicePrices: Record<string, ServicePriceDraft>,

): ServicePriceInput[] {

  return selectedServices.map((service) => ({

    title: service.title,

    serviceSlug: service.serviceSlug,

    minRaw: servicePrices[service.serviceSlug]?.minRaw ?? '',

    maxRaw: servicePrices[service.serviceSlug]?.maxRaw ?? '',

    quoteRequired: servicePrices[service.serviceSlug]?.quoteRequired ?? false,

    isCustom: service.isCustom,

  }));

}



export default function RegisterScreen() {

  const router = useRouter();

  const { signUp, signIn, beginRegistration, finishRegistration } = useAuth();



  const [phase, setPhase] = useState<OnboardingPhase>('intro');

  const [error, setError] = useState<string | null>(null);



  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [phone, setPhone] = useState('');

  const [accountKind, setAccountKind] = useState<OnboardingAccountKind>('individual');

  const [firstName, setFirstName] = useState('');

  const [lastName, setLastName] = useState('');

  const [companyName, setCompanyName] = useState('');

  const [emailAvailabilityError, setEmailAvailabilityError] = useState<string | null>(null);

  const [emailChecking, setEmailChecking] = useState(false);

  const emailCheckRequestRef = useRef(0);

  const [phoneAvailabilityError, setPhoneAvailabilityError] = useState<string | null>(null);

  const [phoneChecking, setPhoneChecking] = useState(false);

  const phoneCheckRequestRef = useRef(0);

  const [priceFieldErrors, setPriceFieldErrors] = useState<Record<string, { min?: string; max?: string }>>({});

  const [categorySlug, setCategorySlug] = useState('');

  const [mainCity, setMainCity] = useState<string | null>(null);

  const [nearbyCities, setNearbyCities] = useState<string[]>([]);

  const [mainCityQuery, setMainCityQuery] = useState('');

  const [nearbyCityQuery, setNearbyCityQuery] = useState('');

  const [selectedServices, setSelectedServices] = useState<SelectedOnboardingService[]>([]);

  const [servicePrices, setServicePrices] = useState<Record<string, ServicePriceDraft>>({});



  const progress = useMemo(() => getOnboardingProgress(phase), [phase]);



  const servicePriceInputs = useMemo(

    () => buildServicePriceInputs(selectedServices, servicePrices),

    [selectedServices, servicePrices],

  );



  const buildProfileInput = useCallback(() => {

    const parsedServices = parseServicePrices(servicePriceInputs);

    const displayName = buildOnboardingDisplayName({ accountKind, firstName, lastName, companyName });



    const serviceAreas = mainCity ? [mainCity, ...nearbyCities] : [];



    return {

      name: displayName,

      accountKind,

      firstName: accountKind === 'individual' ? firstName.trim() : undefined,

      lastName: accountKind === 'individual' ? lastName.trim() : undefined,

      companyName: accountKind === 'company' ? companyName.trim() : undefined,

      email: email.trim(),

      phone: phone.trim(),

      categorySlug,

      cities: serviceAreas,

      services: parsedServices.map((service) => {

        const source = selectedServices.find((item) => item.serviceSlug === service.serviceSlug);

        return {

          title: service.title,

          serviceSlug: service.serviceSlug,

          isCustom: source?.isCustom ?? false,

          priceMin: service.priceMin,

          priceMax: service.priceMax,

          quoteRequired: service.quoteRequired,

        };

      }),

      description: '',

    };

  }, [accountKind, categorySlug, companyName, email, firstName, lastName, mainCity, nearbyCities, phone, selectedServices, servicePriceInputs]);



  const checkEmailAvailability = useCallback(async (rawEmail: string) => {

    const trimmed = rawEmail.trim();

    if (!isValidEmail(trimmed)) {

      setEmailAvailabilityError(null);

      return;

    }



    const requestId = ++emailCheckRequestRef.current;

    setEmailChecking(true);



    try {

      const taken = await isEmailAlreadyRegistered(trimmed);

      if (requestId !== emailCheckRequestRef.current) return;

      setEmailAvailabilityError(

        taken ? 'Questa email è già collegata a un account Fidati.' : null,

      );

    } catch {

      if (requestId !== emailCheckRequestRef.current) return;

      setEmailAvailabilityError(null);

    } finally {

      if (requestId === emailCheckRequestRef.current) {

        setEmailChecking(false);

      }

    }

  }, []);



  useEffect(() => {

    if (!email.trim()) {

      setEmailAvailabilityError(null);

      setEmailChecking(false);

      return;

    }



    const timer = setTimeout(() => {

      void checkEmailAvailability(email);

    }, 500);



    return () => clearTimeout(timer);

  }, [checkEmailAvailability, email]);



  const checkPhoneAvailability = useCallback(async (rawPhone: string) => {

    const trimmed = rawPhone.trim();

    if (!isValidPhoneForAvailabilityCheck(trimmed)) {

      setPhoneAvailabilityError(null);

      return;

    }



    const requestId = ++phoneCheckRequestRef.current;

    if (__DEV__) {

      console.log('[REGISTER] phone check start', trimmed);

    }

    setPhoneChecking(true);



    try {

      const taken = await isPhoneAlreadyRegistered(trimmed);

      if (requestId !== phoneCheckRequestRef.current) return;

      if (__DEV__) {

        console.log('[REGISTER] phone check result', { taken });

      }

      setPhoneAvailabilityError(

        taken ? 'Questo numero è già collegato a un account Fidati.' : null,

      );

    } catch {

      if (requestId !== phoneCheckRequestRef.current) return;

      setPhoneAvailabilityError(null);

    } finally {

      if (requestId === phoneCheckRequestRef.current) {

        setPhoneChecking(false);

      }

    }

  }, []);



  useEffect(() => {

    if (!phone.trim()) {

      setPhoneAvailabilityError(null);

      setPhoneChecking(false);

      return;

    }



    const timer = setTimeout(() => {

      void checkPhoneAvailability(phone);

    }, 500);



    return () => clearTimeout(timer);

  }, [checkPhoneAvailability, phone]);



  const addNearbyCity = useCallback((city: string) => {

    const trimmed = city.trim();

    if (!trimmed || mainCity?.toLowerCase() === trimmed.toLowerCase()) return;

    setNearbyCities((current) => {

      if (current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return current;

      return [...current, trimmed];

    });

    setNearbyCityQuery('');

  }, [mainCity]);



  const removeNearbyCity = useCallback((city: string) => {

    setNearbyCities((current) => current.filter((c) => c !== city));

  }, []);



  const toggleService = useCallback((title: string, isCustom = false) => {

    const trimmed = title.trim();

    if (!trimmed) return;



    const serviceSlug = slugifyServiceTitle(trimmed);



    setSelectedServices((current) => {

      const exists = current.some((service) => service.serviceSlug === serviceSlug);

      if (exists) {

        return current.filter((service) => service.serviceSlug !== serviceSlug);

      }

      return [...current, { title: trimmed, serviceSlug, isCustom }];

    });



    setServicePrices((current) => {

      if (serviceSlug in current) {

        const next = { ...current };

        delete next[serviceSlug];

        return next;

      }

      return {

        ...current,

        [serviceSlug]: { title: trimmed, minRaw: '', maxRaw: '', quoteRequired: false },

      };

    });

  }, []);



  const addCustomService = useCallback(

    (title: string) => {

      toggleService(title, true);

    },

    [toggleService],

  );



  const changeServicePrice = useCallback(

    (serviceSlug: string, field: 'minRaw' | 'maxRaw', value: string) => {

      setServicePrices((current) => ({

        ...current,

        [serviceSlug]: {

          title: current[serviceSlug]?.title ?? serviceSlug,

          minRaw: field === 'minRaw' ? value : (current[serviceSlug]?.minRaw ?? ''),

          maxRaw: field === 'maxRaw' ? value : (current[serviceSlug]?.maxRaw ?? ''),

          quoteRequired: current[serviceSlug]?.quoteRequired ?? false,

        },

      }));

      setPriceFieldErrors((currentErrors) => {

        if (!currentErrors[serviceSlug]) return currentErrors;

        const next = { ...currentErrors };

        delete next[serviceSlug];

        return next;

      });

    },

    [],

  );



  const toggleQuoteRequired = useCallback((serviceSlug: string, quoteRequired: boolean) => {
    const source = selectedServices.find((s) => s.serviceSlug === serviceSlug);
    if (!source?.isCustom) return;

    setServicePrices((current) => ({
      ...current,
      [serviceSlug]: {
        title: current[serviceSlug]?.title ?? source.title,
        minRaw: quoteRequired ? '' : (current[serviceSlug]?.minRaw ?? ''),
        maxRaw: quoteRequired ? '' : (current[serviceSlug]?.maxRaw ?? ''),
        quoteRequired,
      },
    }));

    if (quoteRequired) {
      setPriceFieldErrors((currentErrors) => {
        if (!currentErrors[serviceSlug]) return currentErrors;
        const next = { ...currentErrors };
        delete next[serviceSlug];
        return next;
      });
    }
  }, [selectedServices]);



  const resolveAuthUserId = useCallback(async (): Promise<string | null> => {

    const signUpResult = await signUp(email, password);



    if (!signUpResult.error && signUpResult.userId) {

      return signUpResult.userId;

    }



    if (signUpResult.error?.includes('Esiste già')) {

      const signInResult = await signIn(email, password);

      if (signInResult.error) {

        throw new Error(signInResult.error);

      }

      const { data } = await supabase.auth.getSession();

      return data.session?.user?.id ?? null;

    }



    if (signUpResult.error) {

      throw new Error(signUpResult.error);

    }



    return signUpResult.userId ?? null;

  }, [email, password, signIn, signUp]);



  const submitRegistration = useCallback(async () => {

    setError(null);

    setPhase('submitting');

    beginRegistration();



    const profileInput = buildProfileInput();

    devLogRegister('submit payload', profileInput);



    try {

      const signUpResult = await signUp(email, password);

      let authUserId = signUpResult.userId;



      if (signUpResult.error?.includes('Esiste già')) {

        const signInResult = await signIn(email, password);

        if (signInResult.error) {

          throw new Error(signInResult.error);

        }

        const { data } = await supabase.auth.getSession();

        authUserId = data.session?.user?.id;

      } else if (signUpResult.error) {

        throw new Error(signUpResult.error);

      }



      if (!authUserId) {

        throw new Error('Registrazione non completata. Riprova.');

      }



      if (signUpResult.needsEmailConfirmation) {

        await savePendingRegistration({

          ...profileInput,

          authUserId,

          savedAt: new Date().toISOString(),

        });

        await supabase.auth.signOut();

        await finishRegistration();

        setPhase('email-confirmation');

        return;

      }



      await createProfessionalProfile(authUserId, profileInput);

      setPhase('complete');

    } catch (err) {

      devLogRegister('submit error', err);

      await supabase.auth.signOut().catch(() => {});

      await finishRegistration();

      setPhase('step4');

      setError(

        err instanceof Error ? err.message : 'Impossibile creare il profilo professionista. Riprova.',

      );

    }

  }, [beginRegistration, buildProfileInput, email, finishRegistration, password, signIn, signUp]);




  if (phase === 'intro') {

    return <IntroStep onStart={() => setPhase('account')} />;

  }



  if (phase === 'account') {

    return (

      <>

        <AccountStep

          progress={progress}

          errorMessage={error}

          email={email}

          password={password}

          confirmPassword={confirmPassword}

          phone={phone}

          emailError={emailAvailabilityError}

          emailChecking={emailChecking}

          phoneError={phoneAvailabilityError}

          phoneChecking={phoneChecking}

          onChangeEmail={(value) => {

            setEmail(value);

            if (emailAvailabilityError) {

              setEmailAvailabilityError(null);

            }

          }}

          onBlurEmail={() => void checkEmailAvailability(email)}

          onChangePassword={setPassword}

          onChangeConfirmPassword={setConfirmPassword}

          onChangePhone={(value) => {

            setPhone(value);

            if (phoneAvailabilityError) {

              setPhoneAvailabilityError(null);

            }

          }}

          onBlurPhone={() => void checkPhoneAvailability(phone)}

          onContinue={() => {

            const validationError = validateOnboardingAccount({

              email,

              password,

              confirmPassword,

              phone,

              emailTaken: Boolean(emailAvailabilityError),

              phoneTaken: Boolean(phoneAvailabilityError),

            });

            setError(validationError);

            if (!validationError && !emailChecking && !phoneChecking) setPhase('step1');

          }}

        />

      </>

    );

  }



  if (phase === 'step1') {

    return (

      <>

        <AboutYouStep

          progress={progress}

          errorMessage={error}

          accountKind={accountKind}

          firstName={firstName}

          lastName={lastName}

          companyName={companyName}

          categorySlug={categorySlug}

          onChangeAccountKind={setAccountKind}

          onChangeFirstName={setFirstName}

          onChangeLastName={setLastName}

          onChangeCompanyName={setCompanyName}

          onChangeCategory={setCategorySlug}

          onContinue={() => {

            const validationError = validateOnboardingStep1({

              accountKind,

              firstName,

              lastName,

              companyName,

              categorySlug,

            });

            setError(validationError);

            if (!validationError) setPhase('step2');

          }}

        />

      </>

    );

  }



  if (phase === 'step2') {

    return (

      <>

        <WorkAreaStep

          progress={progress}

          errorMessage={error}

          mainCity={mainCity}

          nearbyCities={nearbyCities}

          mainQuery={mainCityQuery}

          nearbyQuery={nearbyCityQuery}

          onChangeMainQuery={setMainCityQuery}

          onChangeNearbyQuery={setNearbyCityQuery}

          onSetMainCity={(city) => {

            const trimmed = city.trim();

            if (!trimmed) return;

            if (mainCity?.toLowerCase() === trimmed.toLowerCase()) {

              setMainCityQuery('');

              return;

            }

            setMainCity(trimmed);

            setMainCityQuery('');

          }}

          onClearMainCity={() => {

            setMainCity(null);

            setNearbyCities([]);

            setMainCityQuery('');

            setNearbyCityQuery('');

          }}

          onAddNearbyCity={addNearbyCity}

          onRemoveNearbyCity={removeNearbyCity}

          onContinue={() => {

            const validationError = validateOnboardingStep2(mainCity);

            setError(validationError);

            if (!validationError) setPhase('step3');

          }}

        />

      </>

    );

  }



  if (phase === 'step3') {

    return (

      <>

        <ServicesStep

          progress={progress}

          errorMessage={error}

          categorySlug={categorySlug}

          selectedServices={selectedServices}

          onToggleService={toggleService}

          onAddCustomService={addCustomService}

          onContinue={() => {

            const validationError = validateOnboardingStep3(

              selectedServices.map((service) => service.title),

            );

            if (validationError) {

              setError(validationError);

              return;

            }



            devLogRegister('selected services', selectedServices);



            setServicePrices((current) => {

              const next = { ...current };

              for (const service of selectedServices) {

                if (!next[service.serviceSlug]) {

                  next[service.serviceSlug] = {

                    title: service.title,

                    minRaw: '',

                    maxRaw: '',

                    quoteRequired: false,

                  };

                }

              }

              return next;

            });



            setError(null);

            setPhase('step4');

          }}

        />

      </>

    );

  }



  if (phase === 'step4') {

    return (

      <>

        <PricingStep

          progress={progress}

          errorMessage={error}

          services={servicePriceInputs}

          fieldErrors={priceFieldErrors}

          onChangeServicePrice={changeServicePrice}

          onToggleQuoteRequired={toggleQuoteRequired}

          onContinue={() => {

            devLogRegister('pricing step input', servicePriceInputs);



            const fieldErrors = validateOnboardingStep4Fields(parseServicePrices(servicePriceInputs));

            setPriceFieldErrors(fieldErrors);



            if (hasOnboardingStep4Errors(fieldErrors)) {

              setError(null);

              return;

            }



            setError(null);

            void submitRegistration();

          }}

        />

      </>

    );

  }



  if (phase === 'submitting') {

    return <HumanLoadingOverlay visible />;

  }



  if (phase === 'email-confirmation') {

    return <EmailConfirmationStep onGoToLogin={() => router.replace('/login')} />;

  }



  if (phase === 'complete') {

    return (

      <CompleteStep

        onEnterApp={async () => {

          await finishRegistration();

          router.replace('/(tabs)');

        }}

      />

    );

  }



  return null;

}



const styles = StyleSheet.create({

  errorBox: {

    position: 'absolute',

    left: Design.spacing.screen,

    right: Design.spacing.screen,

    bottom: 100,

    backgroundColor: Colors.errorSoft,

    borderRadius: Design.radius.md,

    borderWidth: 1,

    borderColor: 'rgba(239, 68, 68, 0.2)',

    padding: 12,

  },

  errorText: {

    fontSize: 13,

    fontWeight: '600',

    color: Colors.error,

    lineHeight: 18,

  },

});

