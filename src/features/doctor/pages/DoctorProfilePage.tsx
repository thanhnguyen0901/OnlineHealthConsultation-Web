import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { loadProfileRequested, updateProfileRequested } from '../redux/doctor.slice';
import { selectDoctorProfile, selectDoctorLoading } from '../redux/doctor.selectors';
import { getSpecialties } from '@/features/admin/apis/admin.api';
import type { Specialty } from '@/features/admin/types';

interface ProfileFormState {
  bio: string;
  yearsOfExperience: number | null;
  specialtyId: string;
}

export const DoctorProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation('doctor');
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectDoctorProfile);
  const loading = useAppSelector(selectDoctorLoading);

  const [form, setForm] = useState<ProfileFormState>({
    bio: '',
    yearsOfExperience: null,
    specialtyId: '',
  });
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialtiesLoading, setSpecialtiesLoading] = useState(false);

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

  // Reuses admin getSpecialties endpoint (no dedicated doctor-facing endpoint exists).
  useEffect(() => {
    setSpecialtiesLoading(true);
    getSpecialties()
      .then(setSpecialties)
      .catch(() => {})
      .finally(() => setSpecialtiesLoading(false));
  }, []);

  const specialtyOptions = specialties.map((s) => ({
    label: i18n.language === 'vi' ? s.nameVi : s.nameEn,
    value: s.id,
  }));

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

  const isSubmitDisabled =
    loading || (!form.bio.trim() && !form.yearsOfExperience && !form.specialtyId);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          {t('editProfile')}
        </h1>

        {/* read-only: personal info changes are admin-only */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <i className="pi pi-user text-blue-500" />
            {t('personalInfo')}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('patientName')}
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
                Email
              </span>
              {profile ? (
                <span className="text-gray-900 dark:text-gray-100">{profile.email}</span>
              ) : (
                <span className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded animate-pulse block" />
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
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
                placeholder={specialtiesLoading ? 'Loading…' : t('selectSpecialty')}
                className="w-full"
                disabled={specialtiesLoading}
                showClear
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                icon="pi pi-save"
                label={t('saveProfile')}
                loading={loading}
                disabled={isSubmitDisabled}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
