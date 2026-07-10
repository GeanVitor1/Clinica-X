using ClinicaX.Application.DTOs;
using FluentValidation;

namespace ClinicaX.Application.Validators;

public class UpdateClinicaRequestValidator : AbstractValidator<UpdateClinicaRequest>
{
    public UpdateClinicaRequestValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Telefone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Endereco).NotEmpty().MaximumLength(500);
        RuleFor(x => x.HorarioAbertura).NotEmpty();
        RuleFor(x => x.HorarioFechamento).NotEmpty();
        RuleFor(x => x.Plano).NotEmpty().MaximumLength(20);
        RuleFor(x => x.DiasFuncionamento)
            .NotEmpty()
            .MaximumLength(20)
            .Must(BeValidDays)
            .WithMessage("Dias de funcionamento inválidos. Use números 0-6 separados por vírgula.");
    }

    private static bool BeValidDays(string dias)
    {
        if (string.IsNullOrWhiteSpace(dias)) return false;
        var parts = dias.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (parts.Length == 0) return false;
        return parts.All(p => int.TryParse(p, out var d) && d is >= 0 and <= 6);
    }
}

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.SenhaAtual).NotEmpty();
        RuleFor(x => x.NovaSenha).NotEmpty().MinimumLength(4).MaximumLength(100);
    }
}
