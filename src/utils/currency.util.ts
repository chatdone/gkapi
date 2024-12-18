import { CompanyId } from '@models/company.model';
import { CompanyService } from '@services';
import cc from 'currency-codes';
import cat from 'countries-and-timezones';

export const getCurrencyCodeByCompanyTimeZone = async (
  companyId: CompanyId,
) => {
  try {
    const companyDefaultTimezone =
      await CompanyService.getCompanyDefaultTimezone({
        companyId,
      });

    const countryName = cat.getCountryForTimezone(companyDefaultTimezone)?.name;

    const currencyCode = cc.country(countryName as string)[0].code;

    return currencyCode;
  } catch (error) {
    return Promise.reject(error);
  }
};
