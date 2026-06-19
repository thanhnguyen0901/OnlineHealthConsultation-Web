import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  loadProfileRequested,
  updateProfileRequested,
  clearProfileUpdated,
} from '../redux/doctor.slice';
import {
  selectDoctorProfile,
  selectDoctorLoading,
  selectDoctorError,
  selectDoctorProfileUpdated,
} from '../redux/doctor.selectors';
import { getPublicSpecialties } from '@/features/public/apis/public.api';
import type { PublicSpecialty } from '@/features/public/types';
import { extractErrorMessage } from '@/utils/errorMessage';
import { isUnauthorizedMessage } from '@/utils/authz';

interface ProfileFormState {
  bio: string;
  yearsOfExperience: number | null;
  specialtyId: string;
}

export const DoctorProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation(['doctor', 'common']);
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectDoctorProfile);
  const loading = useAppSelector(selectDoctorLoading);
  const error = useAppSelector(selectDoctorError);
  const profileUpdated = useAppSelector(selectDoctorProfileUpdated);

  const [form, setForm] = useState<ProfileFormState>({
    bio: '',
    yearsOfExperience: null,
    specialtyId: '',
  });
  const [specialties, setSpecialties] = useState<PublicSpecialty[]>([]);
  const [specialtiesLoading, setSpecialtiesLoading] = useState(false);
  const [specialtiesError, setSpecialtiesError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      dispatch(loadProfileRequested());
    }
  }, [dispatch, profile]);

  useEffect(() => {
    if (profile) {
      setForm({
        bio: profile.bio ?? '',
        yearsOfExperience: profile.yearsOfExperience ?? null,
        specialtyId: profile.specialtyId ?? '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!profileUpdated) return;
    const timer = window.setTimeout(() => {
      dispatch(clearProfileUpdated());
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [dispatch, profileUpdated]);

  useEffect(() => {
    setSpecialtiesLoading(true);
    setSpecialtiesError(null);
    getPublicSpecialties()
      .then(setSpecialties)
      .catch((e) => setSpecialtiesError(extractErrorMessage(e)))
      .finally(() => setSpecialtiesLoading(false));
  }, []);

  const specialtyOptions = specialties.map((s) => ({
    label: i18n.language === 'vi' ? s.nameVi : s.nameEn,
    value: s.id,
  }));

  const resetFormToProfile = () => {
    if (!profile) return;
    setForm({
      bio: profile.bio ?? '',
      yearsOfExperience: profile.yearsOfExperience ?? null,
      specialtyId: profile.specialtyId ?? '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: { bio?: string; yearsOfExperience?: number; specialtyId?: string } = {};
    // Always include bio to allow clearing it; BE accepts empty string.
    payload.bio = form.bio.trim();
    if (form.yearsOfExperience !== null && form.yearsOfExperience !== undefined) {
      payload.yearsOfExperience = form.yearsOfExperience;
    }
    if (form.specialtyId) {
      payload.specialtyId = form.specialtyId;
    }
    dispatch(updateProfileRequested(payload));
  };

  const isDirty =
    !!profile &&
    ((form.bio ?? '').trim() !== (profile.bio ?? '').trim() ||
      (form.yearsOfExperience ?? null) !== (profile.yearsOfExperience ?? null) ||
      (form.specialtyId ?? '') !== (profile.specialtyId ?? ''));

  const isSubmitDisabled = loading || !isDirty;

  return (
    <div data-testid="doctor-profile-page" className="px-4 py-6 md:px-8 md:py-8">
      <div className="w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('editProfile')}
        </h1>
        {error && (
          <div data-testid="error-alert">
            <InlineAlert
              variant="error"
              title={isUnauthorizedMessage(error) ? t('common:errorUnauthorized') : t('common:error')}
              message={error}
              onRetry={() => dispatch(loadProfileRequested())}
              className="mb-4"
            />
          </div>
        )}
        {profileUpdated && (
          <InlineAlert
            variant="success"
            title={t('common:success')}
            message={t('profileSaved')}
            className="mb-4"
          />
        )}
        {specialtiesError && (
          <InlineAlert
            variant="error"
            title={t('common:error')}
            message={specialtiesError}
            className="mb-4"
          />
        )}

        {/* read-only: personal info changes are admin-only */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <i className="pi pi-user text-blue-500" />
            {t('personalInfo')}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('doctorName')}
              </span>
              {profile ? (
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {profile.firstName} {profile.lastName}
                </span>
              ) : (
                <span className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse block" />
              )}
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('common:email')}
              </span>
              {profile ? (
                <span className="text-gray-900 dark:text-gray-100">{profile.email}</span>
              ) : (
                <span className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded animate-pulse block" />
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} data-testid="doctor-profile-form">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <i className="pi pi-briefcase text-blue-500" />
              {t('professionalInfo')}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('bio')}
              </label>
              <InputTextarea
                value={form.bio}
                onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                rows={5}
                className="w-full"
                placeholder={t('bioPlaceholder')}
                maxLength={2000}
              />
              <span className="text-xs text-gray-400 mt-1 block text-right">
                {form.bio.length} / 2000
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('yearsOfExperience')}
              </label>
              <InputNumber
                value={form.yearsOfExperience}
                onValueChange={(e) =>
                  setForm((prev) => ({ ...prev, yearsOfExperience: e.value ?? null }))
                }
                min={0}
                max={60}
                showButtons
                buttonLayout="horizontal"
                decrementButtonClassName="p-button-secondary"
                incrementButtonClassName="p-button-secondary"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('specialty')}
              </label>
              <Dropdown
                value={form.specialtyId || null}
                options={specialtyOptions}
                onChange={(e) => setForm((prev) => ({ ...prev, specialtyId: e.value ?? '' }))}
                placeholder={specialtiesLoading ? t('loadingSpecialties') : t('selectSpecialty')}
                className="w-full"
                disabled={specialtiesLoading}
              />
              {!specialtiesLoading && specialtyOptions.length === 0 && (
                <small className="block mt-1 text-amber-600 dark:text-amber-400">
                  {t('common:noData')}
                </small>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                label={t('discardChanges')}
                onClick={resetFormToProfile}
                disabled={loading || !isDirty || !profile}
              />
              <Button
                type="submit"
                size="sm"
                icon="pi pi-save"
                label={t('saveProfile')}
                loading={loading}
                disabled={isSubmitDisabled}
                data-testid="doctor-profile-save"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
