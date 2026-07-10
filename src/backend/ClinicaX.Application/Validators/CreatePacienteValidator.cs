using ClinicaX.Application.Common;
using ClinicaX.Application.DTOs;
using FluentValidation;

namespace ClinicaX.Application.Validators;

public class CreatePacienteValidator : AbstractValidator<CreatePacienteRequest>
{
    public CreatePacienteValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Cpf).NotEmpty().Length(11).Matches("^[0-9]{11}$")
            .Must(CpfValidator.IsValid).WithMessage("CPF inválido.");
        RuleFor(x => x.Telefone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Observacoes).MaximumLength(1000);
    }
}

public class UpdatePacienteValidator : AbstractValidator<UpdatePacienteRequest>
{
    public UpdatePacienteValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Cpf).NotEmpty().Length(11).Matches("^[0-9]{11}$")
            .Must(CpfValidator.IsValid).WithMessage("CPF inválido.");
        RuleFor(x => x.Telefone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Observacoes).MaximumLength(1000);
    }
}
