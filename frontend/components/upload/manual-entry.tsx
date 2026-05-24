'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiFetch, apiUpload } from '@/lib/api';
import { ImagePlus } from 'lucide-react';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

export function ManualEntry({
  initialData,
  onSave,
}: {
  initialData?: Partial<Product>;
  onSave?: () => void;
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    skuId: initialData?.skuId || '',
    productTitle: initialData?.productTitle || '',
    brand: initialData?.brand || '',
    category: initialData?.category || '',
    price: initialData?.price?.toString() || '',
    mrp: initialData?.mrp?.toString() || '',
    description: initialData?.description || '',
    color: initialData?.color || '',
    size: initialData?.size || '',
    material: initialData?.material || '',
    imageUrl: initialData?.imageUrl || '',
  });

  const mut = useMutation({
    mutationFn: async () =>
      apiFetch<{ skuId: string }>('/products', {
        method: 'POST',
        body: JSON.stringify(formData),
      }),
    onSuccess: (d) => {
      toast.success('Product saved.');
      qc.invalidateQueries({ queryKey: ['product', d.skuId] });
      qc.invalidateQueries({ queryKey: ['products'] });
      if (onSave) onSave();
      else router.push(`/products/${d.skuId}`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Save failed'),
  });

  const uploadMut = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('image', file);
      return apiUpload<{ imageUrl: string }>('/products/upload-image', fd);
    },
    onSuccess: (d) => {
      setFormData({ ...formData, imageUrl: d.imageUrl });
      toast.success('Image uploaded.');
    },
    onError: (e) =>
      toast.error(
        `Image upload failed: ${e instanceof Error ? e.message : String(e)}`,
      ),
  });

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
      <Field label="SKU ID" required disabled={!!initialData?.skuId}>
        <Input
          value={formData.skuId}
          disabled={!!initialData?.skuId}
          onChange={(e) => setFormData({ ...formData, skuId: e.target.value })}
          placeholder="e.g. SHOE001"
          mono
        />
      </Field>

      <Field label="Product title">
        <Input
          value={formData.productTitle}
          onChange={(e) =>
            setFormData({ ...formData, productTitle: e.target.value })
          }
        />
      </Field>

      <Field label="Brand">
        <Input
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
        />
      </Field>

      <Field label="Category">
        <Input
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
      </Field>

      <Field label="Price (₹)">
        <Input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />
      </Field>

      <Field label="MRP (₹)">
        <Input
          type="number"
          value={formData.mrp}
          onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
        />
      </Field>

      <div className="md:col-span-2">
        <Field label="Description">
          <textarea
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/15"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </Field>
      </div>

      <Field label="Color">
        <Input
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
        />
      </Field>
      <Field label="Size">
        <Input
          value={formData.size}
          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
        />
      </Field>
      <Field label="Material">
        <Input
          value={formData.material}
          onChange={(e) => setFormData({ ...formData, material: e.target.value })}
        />
      </Field>

      <div className="md:col-span-2">
        <Field label="Product image">
          <div className="flex items-center gap-4 rounded-xl border border-dashed border-border bg-surface-muted/40 p-4">
            {formData.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.imageUrl}
                alt=""
                className="size-20 rounded-lg border border-border bg-surface object-cover"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-lg border border-dashed border-border bg-surface text-muted-foreground">
                <ImagePlus className="size-5" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="img-upload"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadMut.mutate(f);
                }}
              />
              <label
                htmlFor="img-upload"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-surface-muted"
              >
                {uploadMut.isPending
                  ? 'Uploading…'
                  : formData.imageUrl
                    ? 'Change image'
                    : 'Upload product photo'}
              </label>
              <p className="text-[11px] text-muted-foreground">
                Cloudinary storage · max 5MB
              </p>
            </div>
          </div>
        </Field>
      </div>

      <div className="flex gap-3 pt-2 md:col-span-2">
        {onSave ? (
          <button
            onClick={onSave}
            className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-[13.5px] font-medium text-foreground transition-colors hover:bg-surface-muted"
          >
            Cancel
          </button>
        ) : null}
        <button
          disabled={!formData.skuId || mut.isPending}
          onClick={() => mut.mutate()}
          className="flex-[2] rounded-lg bg-foreground px-4 py-2.5 text-[13.5px] font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {mut.isPending ? 'Saving…' : 'Save product data'}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  disabled,
  children,
}: {
  label: string;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className={cn(
          'flex items-center gap-1 text-[10.5px] font-medium uppercase tracking-[0.18em]',
          disabled ? 'text-muted-foreground/60' : 'text-muted-foreground',
        )}
      >
        <span>{label}</span>
        {required ? (
          <span className="text-[color:var(--brand)]" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children}
    </div>
  );
}

function Input({
  mono,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }) {
  return (
    <input
      {...rest}
      className={cn(
        'h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/15 disabled:opacity-50',
        mono && 'font-mono text-[12.5px]',
        className,
      )}
    />
  );
}
