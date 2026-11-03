import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import ListingForm from '@/components/listings/ListingForm';
import PhotoManager from '@/components/listings/PhotoManager';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { createListing } from '@/lib/listings';
import { toast } from '@/components/ui/use-toast';

const EMPTY = {
  deal_type: 'rent',
  category: 'apartment',
  title: '',
  description: '',
  price: '',
  deposit: '',
  area: '',
  rooms: '1',
  floor: '',
  floors: '',
  year_built: '',
  city: 'Москва',
  district: '',
  metro: '',
  address: '',
  amenities: [],
  pets_allowed: false,
  children_allowed: true,
  utilities_included: false,
  video_url: '',
  floor_plan_url: '',
};

export default function ListingEditor() {
  const { id } = useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, isAuthenticated, addRole } = useAccount();
  const [form, setForm] = useState(EMPTY);
  const [photos, setPhotos] = useState([]);
  const [propertyId, setPropertyId] = useState(null);
  const [existingMedia, setExistingMedia] = useState([]);
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    Promise.all([
      base44.entities.Listing.get(id),
      base44.entities.Media.filter({ listing_id: id }, { sort: 'order', limit: 40 }).catch(() => ({ items: [] })),
    ])
      .then(([listing, media]) => {
        if (!active || !listing) return;
        setForm({
          ...EMPTY,
          ...listing,
          price: String(listing.price ?? ''),
          deposit: String(listing.deposit ?? ''),
          area: String(listing.area ?? ''),
          rooms: String(listing.rooms ?? ''),
          floor: String(listing.floor ?? ''),
          floors: String(listing.floors ?? ''),
          year_built: String(listing.year_built ?? ''),
          amenities: listing.amenities || [],
        });
        setPropertyId(listing.property_id || null);
        setStatus(listing.status);
        const mediaItems = media.items || [];
        setExistingMedia(mediaItems);
        setPhotos(mediaItems.map((item) => ({ file_url: item.file_url, id: item.id })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const validate = () => Boolean(form.title.trim() && form.city && Number(form.price) > 0 && Number(form.area) > 0);

  const save = async (publish) => {
    if (!validate()) {
      toast({ title: t('common.required'), description: t('form.requiredHint'), variant: 'destructive' });
      return;
    }
    if (!isAuthenticated) return;
    setSaving(true);
    try {
      const { property, listingPayload } = await createListing({
        user,
        data: { ...form, status: publish ? 'pending' : 'draft' },
        photos,
        propertyId,
      });

      const payload = {
        ...listingPayload,
        status: publish ? 'pending' : status === 'published' ? 'published' : 'draft',
      };

      let listing;
      if (id) {
        listing = await base44.entities.Listing.update(id, payload);
      } else {
        listing = await base44.entities.Listing.create(payload);
      }

      // Media rows mirror the photo list, keeping its order.
      const keptIds = new Set(photos.filter((photo) => photo.id).map((photo) => photo.id));
      await Promise.all(existingMedia.filter((item) => !keptIds.has(item.id)).map((item) => base44.entities.Media.delete(item.id)));
      await Promise.all(
        photos.map((photo, index) =>
          photo.id
            ? base44.entities.Media.update(photo.id, { order: index, is_cover: index === 0 })
            : base44.entities.Media.create({
                listing_id: listing.id,
                file_url: photo.file_url,
                kind: 'photo',
                order: index,
                is_cover: index === 0,
              })
        )
      );

      if (!user.roles?.includes('owner')) await addRole('owner');

      toast({ title: publish ? t('form.sentToModeration') : t('form.draftSaved') });
      navigate('/my-listings');
    } catch (error) {
      toast({ title: t('errors.generic'), description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading className="py-24" />;

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow={id ? t('form.editTitle') : t('form.createTitle')}
        title={form.title || t('form.createTitle')}
        subtitle={t('form.requiredHint')}
      />
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-5">
            <ListingForm value={form} onChange={setForm} />
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <PhotoManager photos={photos} onChange={setPhotos} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col gap-2">
                <Button className="rounded-full" onClick={() => save(true)} disabled={saving}>
                  {saving ? t('common.processing') : t('form.publish')}
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => save(false)} disabled={saving}>
                  {t('form.saveDraft')}
                </Button>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{t('footer.mockNote')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}