/**
 * Catalog-wide and per-SKU quality reports.
 *
 * These are document-style PDFs — white paper, Helvetica, classic hierarchy.
 * Intentionally NOT mirroring the on-screen "Quiet Editorial" UI: the goal
 * is a legible report someone can print, file, or attach to an email.
 */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Product, Issue } from '@/types';

// Plain document palette — black ink on white paper, gray accents only.
const C = {
  bg: '#FFFFFF',
  ink: '#111111',
  body: '#2A2A2A',
  muted: '#666666',
  rule: '#CCCCCC',
  ruleSoft: '#E5E5E5',
  rowAlt: '#FAFAFA',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.body,
    lineHeight: 1.45,
  },

  // — masthead —
  masthead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 6,
    borderBottomWidth: 0.75,
    borderBottomColor: C.ink,
  },
  org: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: C.ink,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  mastheadRight: {
    fontSize: 9,
    color: C.muted,
  },

  // — title block —
  reportLabel: {
    fontSize: 9,
    color: C.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 24,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: C.ink,
    marginTop: 4,
  },
  lede: {
    fontSize: 10.5,
    color: C.body,
    marginTop: 6,
    maxWidth: 460,
  },

  // — generic section —
  section: { marginTop: 22 },
  h2: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11.5,
    color: C.ink,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
  },
  paragraph: { fontSize: 10, color: C.body, marginBottom: 6 },

  // — KPI grid: simple labeled values, no card chrome —
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  kpi: {
    width: '25%',
    paddingVertical: 6,
    paddingRight: 12,
  },
  kpiLabel: {
    fontSize: 8.5,
    color: C.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  kpiValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: C.ink,
  },
  kpiHint: { fontSize: 8.5, color: C.muted, marginTop: 2 },

  // — table —
  table: {
    marginTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: C.rule,
  },
  thead: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
    paddingVertical: 6,
  },
  th: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: C.muted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tr: {
    flexDirection: 'row',
    paddingVertical: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: C.ruleSoft,
  },
  trAlt: { backgroundColor: C.rowAlt },
  td: { fontSize: 10, color: C.body },

  // — issues —
  issueBlock: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: C.ruleSoft,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 3,
  },
  issueSev: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    letterSpacing: 0.6,
    color: C.ink,
    minWidth: 50,
  },
  issueTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    color: C.ink,
    flex: 1,
  },
  issueFix: { fontSize: 9.5, color: C.body, marginLeft: 58 },
  issueFixLabel: { fontFamily: 'Helvetica-Bold', color: C.ink },

  // — footer —
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 56,
    right: 56,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: C.rule,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8.5,
    color: C.muted,
  },
});

// — — data types — — //

export type QualitySummary = {
  totalProducts: number;
  issueCounts: { HIGH: number; MEDIUM: number; LOW: number };
  avgQualityScore: number;
  missingImageCount: number;
  invalidPriceCount: number;
  weakListings: {
    skuId: string;
    productTitle: string | null;
    qualityScore: number;
  }[];
};

interface CatalogReportProps {
  data: QualitySummary;
  generatedAt?: Date;
  generatedBy?: string;
}

// — — catalog report — — //

export function CatalogQualityReport({
  data,
  generatedAt = new Date(),
  generatedBy,
}: CatalogReportProps) {
  const dateStr = formatDate(generatedAt);

  return (
    <Document
      title={`Catalog Quality Report — ${dateStr}`}
      author={generatedBy || 'Product Insights'}
    >
      <Page size="A4" style={styles.page}>
        <Masthead dateStr={dateStr} generatedBy={generatedBy} />

        <Text style={styles.reportLabel}>Report</Text>
        <Text style={styles.title}>Catalog Quality</Text>
        <Text style={styles.lede}>
          A snapshot of listing health across your catalog, including extraction
          issues by severity and the lowest-scoring listings to address first.
        </Text>

        <View style={styles.section}>
          <Text style={styles.h2}>Summary</Text>
          <View style={styles.kpiGrid}>
            <Kpi
              label="Total products"
              value={data.totalProducts.toLocaleString()}
              hint="Ingested SKUs"
            />
            <Kpi
              label="Average quality"
              value={`${Math.round(data.avgQualityScore)}%`}
              hint="Target ≥ 80%"
            />
            <Kpi
              label="High-severity issues"
              value={String(data.issueCounts.HIGH)}
              hint="Require action"
            />
            <Kpi
              label="Missing images"
              value={String(data.missingImageCount)}
              hint="Listings without media"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Issue distribution</Text>
          <View style={styles.table}>
            <View style={styles.thead}>
              <Text style={[styles.th, { flex: 1 }]}>Category</Text>
              <Text style={[styles.th, { width: 80, textAlign: 'right' }]}>
                Count
              </Text>
              <Text style={[styles.th, { width: 80, textAlign: 'right' }]}>
                Share
              </Text>
            </View>
            {distributionRows(data).map((r, i) => (
              <View
                key={r.label}
                style={[styles.tr, i % 2 === 1 ? styles.trAlt : {}]}
              >
                <Text style={[styles.td, { flex: 1 }]}>{r.label}</Text>
                <Text style={[styles.td, { width: 80, textAlign: 'right' }]}>
                  {r.count}
                </Text>
                <Text
                  style={[
                    styles.td,
                    { width: 80, textAlign: 'right', color: C.muted },
                  ]}
                >
                  {r.share}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.h2}>Weakest listings</Text>
          {data.weakListings.length === 0 ? (
            <Text style={styles.paragraph}>
              No weak listings — every SKU is above the threshold.
            </Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.thead}>
                <Text style={[styles.th, { width: '20%' }]}>SKU</Text>
                <Text style={[styles.th, { flex: 1 }]}>Title</Text>
                <Text style={[styles.th, { width: 60, textAlign: 'right' }]}>
                  Score
                </Text>
              </View>
              {data.weakListings.slice(0, 20).map((p, i) => (
                <View
                  key={p.skuId}
                  style={[styles.tr, i % 2 === 1 ? styles.trAlt : {}]}
                >
                  <Text style={[styles.td, { width: '20%' }]}>{p.skuId}</Text>
                  <Text style={[styles.td, { flex: 1 }]}>
                    {p.productTitle || '(missing title)'}
                  </Text>
                  <Text
                    style={[styles.td, { width: 60, textAlign: 'right' }]}
                  >
                    {p.qualityScore}%
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Footer />
      </Page>
    </Document>
  );
}

// — — product detail report — — //

type ProductDetail = Product & { issues: Issue[] };

interface ProductReportProps {
  product: ProductDetail;
  generatedAt?: Date;
  generatedBy?: string;
}

export function ProductQualityReport({
  product,
  generatedAt = new Date(),
  generatedBy,
}: ProductReportProps) {
  const dateStr = formatDate(generatedAt);

  type SevCount = { HIGH: number; MEDIUM: number; LOW: number };
  const counts = product.issues.reduce<SevCount>(
    (acc: SevCount, i: Issue) => {
      acc[i.severity as 'HIGH' | 'MEDIUM' | 'LOW'] += 1;
      return acc;
    },
    { HIGH: 0, MEDIUM: 0, LOW: 0 },
  );

  return (
    <Document
      title={`${product.skuId} — Listing report — ${dateStr}`}
      author={generatedBy || 'Product Insights'}
    >
      <Page size="A4" style={styles.page}>
        <Masthead dateStr={dateStr} generatedBy={generatedBy} />

        <Text style={styles.reportLabel}>Listing report · {product.skuId}</Text>
        <Text style={styles.title}>
          {product.productTitle || '(Untitled listing)'}
        </Text>
        <Text style={styles.lede}>
          {[product.brand, product.category].filter(Boolean).join(' · ') ||
            'Uncategorised'}
        </Text>

        <View style={styles.section}>
          <Text style={styles.h2}>Summary</Text>
          <View style={styles.kpiGrid}>
            <Kpi
              label="Quality score"
              value={`${product.qualityScore}%`}
              hint={
                product.qualityScore >= 80
                  ? 'Above threshold'
                  : 'Below threshold'
              }
            />
            <Kpi
              label="List price"
              value={product.price ? `Rs ${product.price}` : '—'}
            />
            <Kpi
              label="MRP"
              value={product.mrp ? `Rs ${product.mrp}` : '—'}
            />
            <Kpi
              label="Issues"
              value={String(product.issues.length)}
              hint={`${counts.HIGH} high · ${counts.MEDIUM} med · ${counts.LOW} low`}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Attributes</Text>
          <View style={styles.table}>
            <AttrRow label="SKU" value={product.skuId} alt={false} />
            <AttrRow label="Brand" value={product.brand || '—'} alt={true} />
            <AttrRow label="Category" value={product.category || '—'} alt={false} />
            <AttrRow label="Color" value={product.color || '—'} alt={true} />
            <AttrRow label="Size" value={product.size || '—'} alt={false} />
            <AttrRow label="Material" value={product.material || '—'} alt={true} />
            <AttrRow
              label="Availability"
              value={product.availability || '—'}
              alt={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>
            Audit findings ({product.issues.length})
          </Text>
          {product.issues.length === 0 ? (
            <Text style={styles.paragraph}>
              No quality issues detected. This listing passes every audit rule.
            </Text>
          ) : (
            product.issues.map((i: Issue) => (
              <View key={i.id} style={styles.issueBlock} wrap={false}>
                <View style={styles.issueHeader}>
                  <Text style={styles.issueSev}>{i.severity}</Text>
                  <Text style={styles.issueTitle}>{i.message}</Text>
                </View>
                <Text style={styles.issueFix}>
                  <Text style={styles.issueFixLabel}>Suggested fix — </Text>
                  {i.suggestedFix}
                </Text>
              </View>
            ))
          )}
        </View>

        <Footer />
      </Page>
    </Document>
  );
}

// — — primitives — — //

function Masthead({
  dateStr,
  generatedBy,
}: {
  dateStr: string;
  generatedBy?: string;
}) {
  return (
    <View style={styles.masthead}>
      <Text style={styles.org}>Product Insights</Text>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.mastheadRight}>{dateStr}</Text>
        {generatedBy ? (
          <Text style={styles.mastheadRight}>Prepared for {generatedBy}</Text>
        ) : null}
      </View>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text>Product Insights — Confidential</Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {hint ? <Text style={styles.kpiHint}>{hint}</Text> : null}
    </View>
  );
}

function AttrRow({
  label,
  value,
  alt,
}: {
  label: string;
  value: string;
  alt: boolean;
}) {
  return (
    <View style={[styles.tr, alt ? styles.trAlt : {}]}>
      <Text style={[styles.td, { width: 130, color: C.muted }]}>{label}</Text>
      <Text style={[styles.td, { flex: 1 }]}>{value}</Text>
    </View>
  );
}

// — — helpers — — //

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function distributionRows(data: QualitySummary): {
  label: string;
  count: number;
  share: string;
}[] {
  const total =
    data.issueCounts.HIGH +
    data.issueCounts.MEDIUM +
    data.issueCounts.LOW +
    data.invalidPriceCount;
  const share = (n: number) =>
    total > 0 ? `${((n / total) * 100).toFixed(0)}%` : '—';

  return [
    { label: 'High severity', count: data.issueCounts.HIGH, share: share(data.issueCounts.HIGH) },
    { label: 'Medium severity', count: data.issueCounts.MEDIUM, share: share(data.issueCounts.MEDIUM) },
    { label: 'Low severity', count: data.issueCounts.LOW, share: share(data.issueCounts.LOW) },
    { label: 'Invalid pricing', count: data.invalidPriceCount, share: share(data.invalidPriceCount) },
  ];
}
