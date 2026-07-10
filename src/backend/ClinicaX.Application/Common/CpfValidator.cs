namespace ClinicaX.Application.Common;

public static class CpfValidator
{
    public static bool IsValid(string? cpf)
    {
        if (string.IsNullOrWhiteSpace(cpf)) return false;
        var numeros = cpf.Where(char.IsDigit).ToArray();
        if (numeros.Length != 11) return false;
        if (numeros.Distinct().Count() == 1) return false;

        var dig1 = Calc(numeros, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
        var dig2 = Calc(numeros, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
        return numeros[9] - '0' == dig1 && numeros[10] - '0' == dig2;
    }

    private static int Calc(char[] numeros, int[] pesos)
    {
        var soma = 0;
        for (var i = 0; i < pesos.Length; i++)
            soma += (numeros[i] - '0') * pesos[i];
        var resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}
