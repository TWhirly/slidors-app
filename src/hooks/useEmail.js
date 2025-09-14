import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const useEmail = (companyId = null, contactId = null, isNewContact = false) => {

  const fetchContactMail = async () => {
    if(isNewContact) return [{id: uuidv4(), mail: ''}];
      console.log('fecthcContactMail')
      const params = {
        name: 'Ваше имя',
        contactId: contactId,
        api: 'getContactEmails'
      };
      const formData = JSON.stringify(params);
      const response = await axios.post(
        process.env.REACT_APP_GOOGLE_SHEETS_URL,
        formData,
      );
      let fetchedMails = response.data;
      if (fetchedMails) {
        // setLoadingMail(false);
        console.log('mails', fetchedMails);
      }
      return fetchedMails;
    };

    const fetchCompanyMail = async () => {
      if(isNewContact) return [{id: uuidv4(), mail: ''}];
      console.log('fecthcMail')
      const params = {
        name: 'Ваше имя',
        companyId: companyId,
        api: 'getEmails'
      };
      const formData = JSON.stringify(params);
      const response = await axios.post(
        process.env.REACT_APP_GOOGLE_SHEETS_URL,
        formData,
      );
      let fetchedMails = response.data;
      if (fetchedMails) {
        console.log('mails', fetchedMails);
      }
      return fetchedMails;
    };

  const { data: contactMails, isLoading: isContactsMailsLoading, mailsFetchError } = useQuery({
    queryKey: ['emails', companyId, contactId, isNewContact],
    queryFn: contactId ? fetchContactMail : fetchCompanyMail,
    staleTime: 600000, // Data is considered fresh for 5 minutes (300,000 ms)
    refetchInterval: 600000, // Refetch data every 600 seconds in the background
  });
  console.log('useEmail', 'contactId', contactId, 'companyId', companyId, 'isContactsMailsLoading', isContactsMailsLoading)

  return {
    contactMails: contactMails || [],
    isContactsMailsLoading,
    mailsFetchError
  };
};