using ClinicaX.Application.DTOs;
using FluentValidation;

namespace ClinicaX.Application.Validators;

public class CreateProntuarioValidator : AbstractValidator<CreateProntuarioRequest>
{
    public CreateProntuarioValidator()
    {
        RuleFor(x => x.Data).NotEmpty();
    }
}

public class UpdateProntuarioValidator : AbstractValidator<UpdateProntuarioRequest>
{
    public UpdateProntuarioValidator()
    {
        RuleFor(x => x.Descricao).MaximumLength(2000);
        RuleFor(x => x.Diagnostico).MaximumLength(1000);
        RuleFor(x => x.Prescricao).MaximumLength(1000);
    }
}
