// https://medium.com/@vshab/create-react-app-and-sentry-cde1f15cbaa

const SentryCli = require('@sentry/cli');

async function createReleaseAndUpload() {
    const release = "rel-2";
    if (!release) {
        console.warn('APP_VERSION is not set');
        return;
    }
    const cli = new SentryCli();
    try {
        console.log('Creating sentry release ' + release);
        await cli.releases.new(release);
        console.log('Uploading source maps');
        await cli.releases.uploadSourceMaps(release, {
            include: ['../../build/'],
            urlPrefix: '~/build',
            rewrite: false,
        });
        console.log('Finalizing release');
        await cli.releases.finalize(release);
    } catch (e) {
        console.error('Source maps uploading failed:', e);
    }
}
createReleaseAndUpload();
