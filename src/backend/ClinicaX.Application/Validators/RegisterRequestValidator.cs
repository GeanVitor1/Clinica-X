using ClinicaX.Application.DTOs;
using FluentValidation;

namespace ClinicaX.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.NomeClinica).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Senha).NotEmpty().MinimumLength(8).MaximumLength(100)
            .Matches("[A-Z]").WithMessage("Senha deve conter letra maiúscula.")
            .Matches("[a-z]").WithMessage("Senha deve conter letra minúscula.")
            .Matches("[0-9]").WithMessage("Senha deve conter número.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Senha deve conter caractere especial.");
        RuleFor(x => x.Telefone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Endereco).MaximumLength(500);
        RuleFor(x => x.NomeResponsavel).MaximumLength(200);
    }
}
