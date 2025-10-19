import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyService } from '../../../../service/company.service';
import { Company } from '../../../../model/company.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-details.html',
  styleUrls: ['./company-details.css']
})
export class CompanyDetails implements OnInit {
  // use `any` here to avoid strict template-check failures when your Company model differs.
  company: any = {};
  isEditMode = false;
  saving = false;
  error: string | null = null;
  success: string | null = null;

  // local logo file & preview
  logoFile?: File | null;
  logoPreviewUrl?: string | null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private companySvc: CompanyService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      const id = Number(idParam);
      this.loadCompany(id);
    } else {
      // default empty company shape — keep minimal required fields so template validation works
      this.company = {
        name: '',
        industry: '',
        description: '',
        location: '',
        email: ''
      };
    }
  }

  get companyFormInvalid(): boolean {
    // minimal client-side validation
    return !this.company?.name || !this.company?.industry || !this.company?.email || !this.company?.location || !this.company?.description;
  }

  loadCompany(id: number) {
    this.companySvc.get(id).subscribe({
      next: (c: Company) => {
        // assign to local any-typed object
        this.company = { ...c };
        // map logoUrl to preview if available
        if ((c as any).logoUrl) {
          this.logoPreviewUrl = (c as any).logoUrl;
        }
      },
      error: (err) => {
        console.error('Failed to load company', err);
        this.error = 'Failed to load company details';
      }
    });
  }

  onFileSelect(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const f = input.files && input.files[0];
    if (!f) {
      this.logoFile = null;
      this.logoPreviewUrl = undefined;
      return;
    }
    this.logoFile = f;
    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(f);
  }

  removeLogo() {
    this.logoFile = null;
    this.logoPreviewUrl = undefined;
  }

  onSubmit() {
    if (this.companyFormInvalid) {
      this.error = 'Please complete required fields';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.saving = true;
    this.error = null;
    this.success = null;

    // Build payload but avoid sending `null` values (use undefined instead)
    const payload: Partial<Company & { linkedinUrl?: string; instagramUrl?: string; facebookUrl?: string; twitterUrl?: string }> = {
      name: this.company.name,
      industry: this.company.industry,
      founded: this.company.founded ?? undefined,
      size: this.company.size ?? undefined,
      website: this.company.website ?? undefined,
      email: this.company.email,
      phone: this.company.phone ?? undefined,
      location: this.company.location,
      description: this.company.description,
      about: this.company.about ?? undefined,
      linkedinUrl: this.company.linkedinUrl ?? undefined,
      facebookUrl: this.company.facebookUrl ?? undefined,
      instagramUrl: this.company.instagramUrl ?? undefined,
      twitterUrl: this.company.twitterUrl ?? undefined
    };

    if (this.isEditMode && this.company?.id) {
      const id = Number(this.company.id);
      this.companySvc.update(id, payload).subscribe({
        next: (res: any) => {
          this.success = 'Company updated successfully';
          // Upload logo if present
          this.maybeUploadLogoAndFinish(id);
        },
        error: (err) => {
          console.error('Update failed', err);
          this.error = err?.error?.message ?? 'Failed to update company';
          this.saving = false;
        }
      });
    } else {
      // create
      this.companySvc.create(payload).subscribe({
        next: (created: any) => {
          // backend may return created company object or id — handle both
          const createdId = (created && typeof created === 'object' && (created.id || (created as any).company?.id))
            ? (created.id ?? (created as any).company?.id)
            : (typeof created === 'number' ? created : undefined);

          this.success = 'Company created successfully';
          if (this.logoFile && createdId) {
            this.uploadLogo(createdId, this.logoFile).then(() => {
              this.saving = false;
              this.router.navigate(['/recruiter', 'companies', createdId]);
            }).catch((err) => {
              console.warn('Logo upload failed', err);
              this.saving = false;
              if (createdId) this.router.navigate(['/recruiter', 'companies', createdId]);
            });
          } else {
            this.saving = false;
            if (createdId) this.router.navigate(['/recruiter', 'companies', createdId]);
          }
        },
        error: (err) => {
          console.error('Create failed', err);
          this.error = err?.error?.message ?? 'Failed to create company';
          this.saving = false;
        }
      });
    }
  }

  private maybeUploadLogoAndFinish(companyId: number) {
    if (!this.logoFile) {
      this.saving = false;
      return;
    }

    const svc: any = this.companySvc as any;
    if (typeof svc.uploadLogo === 'function') {
      svc.uploadLogo(companyId, this.logoFile).subscribe({
        next: () => { this.saving = false; },
        error: (err: any) => {
          console.warn('uploadLogo failed', err);
          this.saving = false;
        }
      });
      return;
    }

    this.uploadLogo(companyId, this.logoFile).then(() => { this.saving = false; })
      .catch((err) => {
        console.warn('fallback uploadLogo failed', err);
        this.saving = false;
      });
  }

  private async uploadLogo(companyId: number | string, file: File): Promise<void> {
    const url = `/api/companies/${companyId}/logo`;
    const fd = new FormData();
    fd.append('file', file, file.name);
    try {
      // HttpClient .post().toPromise is deprecated in newer RxJS / Angular; use lastValueFrom in real code.
      await this.http.post(url, fd).toPromise();
    } catch (err) {
      throw err;
    }
  }

  cancel() {
    this.router.navigate(['/recruiter', 'companies']);
  }
}
