// Temporärer RAG-Speicher für Arztbriefe (pro Session, nicht persistent)
export class TempRagStorage {
  private static instance: TempRagStorage;
  private docs: string[] = [];

  private constructor() {}

  public static getInstance(): TempRagStorage {
    if (!TempRagStorage.instance) {
      TempRagStorage.instance = new TempRagStorage();
    }
    return TempRagStorage.instance;
  }

  public addDoc(doc: string) {
    this.docs.push(doc);
  }

  public clear() {
    this.docs = [];
  }

  public getAllDocs(): string[] {
    return this.docs;
  }
}
