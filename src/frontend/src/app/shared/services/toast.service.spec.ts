import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a toast', () => {
    service.show('success', 'Teste');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Teste');
    expect(service.toasts()[0].type).toBe('success');
  });

  it('should dismiss a toast', () => {
    service.show('error', 'Erro');
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts().length).toBe(0);
  });

  it('should add multiple toasts', () => {
    service.show('info', 'Info 1');
    service.show('warning', 'Warning 2');
    expect(service.toasts().length).toBe(2);
  });
});
