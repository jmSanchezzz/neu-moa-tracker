import { collection, doc, Firestore, getDocs, Timestamp, writeBatch } from "firebase/firestore";
import { NEU_COLLEGES, PrimaryStatus, SubStatusMap } from "@/lib/mock-data";

const INDUSTRY_POOL = [
  "Technology",
  "Healthcare",
  "Education",
  "Banking",
  "Manufacturing",
  "Logistics",
  "Media",
  "Telecommunications",
  "Public Service",
  "Hospitality",
];

const STATUS_ROTATION: PrimaryStatus[] = ["PROCESSING", "APPROVED", "APPROVED", "EXPIRED"];

const SUB_STATUS_BY_PRIMARY: { [K in PrimaryStatus]: SubStatusMap[K][] } = {
  PROCESSING: ["AWAITING_HTE_SIGNATURE", "LEGAL_REVIEW", "VPAA_APPROVAL"],
  APPROVED: ["SIGNED_BY_PRESIDENT", "ONGOING_NOTARIZATION", "NO_NOTARIZATION_NEEDED"],
  EXPIRED: ["NO_RENEWAL_DONE"],
};

const MAX_BATCH_WRITES = 450;

type SeedMoaOptions = {
  db: Firestore;
  perCollege: number;
  actor: SeedActor;
};

type SeedActor = {
  id: string;
  name: string;
};

type ClearSeededMoasOptions = {
  db: Firestore;
  actor: SeedActor;
};

function formatDateOnly(date: Date): string {
  return date.toISOString().split("T")[0];
}

function collegeCode(college: string): string {
  return college
    .split(" ")
    .filter((word) => !["of", "and", "the"].includes(word.toLowerCase()))
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 6);
}

function buildMoaPayload(college: string, collegeIdx: number, itemIdx: number, docId: string) {
  const primaryStatus = STATUS_ROTATION[(collegeIdx + itemIdx) % STATUS_ROTATION.length];
  const subStatusOptions = SUB_STATUS_BY_PRIMARY[primaryStatus];
  const subStatus = subStatusOptions[(collegeIdx + itemIdx) % subStatusOptions.length];
  const industryType = INDUSTRY_POOL[(collegeIdx + itemIdx) % INDUSTRY_POOL.length];

  const effectiveDate = new Date();
  effectiveDate.setDate(effectiveDate.getDate() - (collegeIdx * 2 + itemIdx) * 11);

  const expirationDate = new Date(effectiveDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 2);
  if (primaryStatus === "EXPIRED") {
    expirationDate.setDate(expirationDate.getDate() - 120);
  }

  const code = collegeCode(college) || "NEU";
  const year = effectiveDate.getFullYear();
  const sequence = String(itemIdx + 1).padStart(2, "0");
  const hteId = `HTE-${code}-${year}-SEED-${sequence}`;

  return {
    id: docId,
    hteId,
    companyName: `${industryType} Partner ${code}-${sequence}`,
    companyAddress: `${100 + collegeIdx} Academic Avenue, Cabanatuan City`,
    contactPerson: `Coordinator ${code} ${sequence}`,
    contactPersonEmail: `coordinator.${code.toLowerCase()}.${sequence}@partner.neu.edu.ph`,
    industryType,
    effectiveDate: formatDateOnly(effectiveDate),
    expirationDate: Timestamp.fromDate(expirationDate),
    primaryStatus,
    subStatus,
    college,
    isDeleted: false,
    createdAt: Timestamp.now(),
  };
}

export async function seedMoasAcrossColleges({ db, perCollege, actor }: SeedMoaOptions) {
  const safePerCollege = Math.max(1, Math.min(25, Math.floor(perCollege)));
  const allWrites: Array<{ collectionName: "memoranda_of_agreement"; payload: Record<string, unknown> }> = [];

  NEU_COLLEGES.forEach((college, collegeIdx) => {
    for (let itemIdx = 0; itemIdx < safePerCollege; itemIdx += 1) {
      const moaRef = doc(collection(db, "memoranda_of_agreement"));
      const payload = buildMoaPayload(college, collegeIdx, itemIdx, moaRef.id);
      allWrites.push({ collectionName: "memoranda_of_agreement", payload });
    }
  });

  for (let start = 0; start < allWrites.length; start += MAX_BATCH_WRITES) {
    const chunk = allWrites.slice(start, start + MAX_BATCH_WRITES);
    const batch = writeBatch(db);

    chunk.forEach(({ collectionName, payload }) => {
      const targetRef = doc(db, collectionName, String(payload.id));
      batch.set(targetRef, payload);
    });

    await batch.commit();
  }

  const summaryRef = doc(collection(db, "audit_logs"));
  const summaryBatch = writeBatch(db);
  summaryBatch.set(summaryRef, {
    userId: actor.id,
    userName: actor.name,
    operation: "INSERT",
    moaId: "SEED-BULK",
    timestamp: Timestamp.now(),
    details: `Seeded ${allWrites.length} MOA records across ${NEU_COLLEGES.length} colleges (${safePerCollege} per college).`,
  });
  await summaryBatch.commit();

  return {
    inserted: allWrites.length,
    colleges: NEU_COLLEGES.length,
    perCollege: safePerCollege,
  };
}

export async function clearSeededMoas({ db, actor }: ClearSeededMoasOptions) {
  const allMoasSnapshot = await getDocs(collection(db, "memoranda_of_agreement"));
  const seededDocIds: string[] = [];

  allMoasSnapshot.forEach((snapshotDoc) => {
    const hteId = snapshotDoc.data()?.hteId;
    if (typeof hteId === "string" && hteId.includes("-SEED-")) {
      seededDocIds.push(snapshotDoc.id);
    }
  });

  for (let start = 0; start < seededDocIds.length; start += MAX_BATCH_WRITES) {
    const chunk = seededDocIds.slice(start, start + MAX_BATCH_WRITES);
    const batch = writeBatch(db);

    chunk.forEach((id) => {
      batch.delete(doc(db, "memoranda_of_agreement", id));
    });

    await batch.commit();
  }

  const summaryRef = doc(collection(db, "audit_logs"));
  const summaryBatch = writeBatch(db);
  summaryBatch.set(summaryRef, {
    userId: actor.id,
    userName: actor.name,
    operation: "DELETE",
    moaId: "SEED-BULK",
    timestamp: Timestamp.now(),
    details: `Cleared ${seededDocIds.length} seeded MOA records from memoranda_of_agreement.`,
  });
  await summaryBatch.commit();

  return {
    deleted: seededDocIds.length,
    scanned: allMoasSnapshot.size,
  };
}