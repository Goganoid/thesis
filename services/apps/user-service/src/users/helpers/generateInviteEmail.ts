import * as fs from 'fs-extra';
import * as path from 'path';
import * as handlebars from 'handlebars';

const readTemplate = async (templateName: string) => {
  const template = await fs.readFile(
    path.join(
      __dirname,
      '..',
      '..',
      'assets',
      'templates',
      `${templateName}.hbs`,
    ),
    'utf8',
  );
  return handlebars.compile(template);
};
const generateEmail = async (templateName: string, data?: any) => {
  const template = await readTemplate(templateName);
  const htmlToSend = template(data);
  return htmlToSend;
};

export const generateInviteEmail = async (data: { link: string }) => {
  return await generateEmail('invite', data);
};
