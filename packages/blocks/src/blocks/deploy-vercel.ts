import type {
  Block,
  BlockConfig,
  Constraint,
  PermissionDef,
  SecretDef,
  YamlFragment,
  WorkflowStep,
} from '../types.js';

export const deployVercel: Block = {
  id: 'deploy-vercel',
  name: 'Deploy to Vercel',
  description: 'Deploy to Vercel using the Vercel CLI',

  emit(config?: BlockConfig): YamlFragment {
    const isProduction = config?.environment === 'production';
    const workingDirectory = config?.workingDirectory;

    const tokenRef = '${{ secrets.VERCEL_TOKEN }}';
    const steps: WorkflowStep[] = [
      {
        name: 'Install Vercel CLI',
        run: 'npm install --global vercel@latest',
      },
      {
        name: 'Pull Vercel Environment Information',
        run: `vercel pull --yes --environment=${isProduction ? 'production' : 'preview'} --token=${tokenRef}`,
        ...(workingDirectory && { 'working-directory': workingDirectory }),
      },
      {
        name: 'Build Project Artifacts',
        run: `vercel build${isProduction ? ' --prod' : ''} --token=${tokenRef}`,
        ...(workingDirectory && { 'working-directory': workingDirectory }),
      },
      {
        name: 'Deploy Project Artifacts to Vercel',
        id: 'deploy',
        run: `vercel deploy --prebuilt${isProduction ? ' --prod' : ''} --token=${tokenRef}`,
        ...(workingDirectory && { 'working-directory': workingDirectory }),
      },
    ];

    return {
      steps,
      env: {
        VERCEL_ORG_ID: '${{ secrets.VERCEL_ORG_ID }}',
        VERCEL_PROJECT_ID: '${{ secrets.VERCEL_PROJECT_ID }}',
      },
    };
  },

  secrets(): SecretDef[] {
    return [
      {
        name: 'VERCEL_TOKEN',
        description: 'Vercel API token for deployment',
        required: true,
        example: 'Go to Vercel > Settings > Tokens to create one',
      },
      {
        name: 'VERCEL_ORG_ID',
        description: 'Vercel Organization/Team ID',
        required: true,
        example: 'Found in .vercel/project.json after running vercel link',
      },
      {
        name: 'VERCEL_PROJECT_ID',
        description: 'Vercel Project ID',
        required: true,
        example: 'Found in .vercel/project.json after running vercel link',
      },
    ];
  },

  permissions(): PermissionDef[] {
    return [];
  },

  constraints(): Constraint[] {
    return [
      {
        type: 'requires-secrets',
        value: 'VERCEL_TOKEN,VERCEL_ORG_ID,VERCEL_PROJECT_ID',
      },
    ];
  },
};
