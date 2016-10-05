import React from 'react';
import { withRouter } from 'react-router';
import Reflux from 'reflux';
import Helmet from 'react-helmet';
import _ from 'lodash';

import { SnackbarNotificationMixin } from '../../mixins';

import HostingFilesStore from './HostingFilesStore';
import HostingFilesActions from './HostingFilesActions';
import HostingPublishDialogActions from './HostingPublishDialogActions';

import { FontIcon, RaisedButton } from 'material-ui';
import { InnerToolbar, Container, Show } from '../../common';
import HostingFilesList from './HostingFilesList';
import HostingDialog from './HostingDialog';
import HostingPublishDialog from './HostingPublishDialog';

const HostingFilesView = React.createClass({
  mixins: [
    Reflux.connect(HostingFilesStore),
    SnackbarNotificationMixin
  ],

  componentDidMount() {
    const { hostingId } = this.props.params;

    HostingFilesActions.setHostingId(hostingId);
    HostingFilesActions.fetch();
  },

  getRedirectUrl() {
    const { hostingDetails } = this.state;
    const { instanceName } = this.props.params;
    const defaultHostingUrl = `https://${instanceName}.syncano.site/`;
    const hasDomains = hostingDetails && hostingDetails.domains.length > 0;
    const customDomainUrl = hasDomains ? `https://${instanceName}--${hostingDetails.domains[0]}.syncano.site/` : null;
    const redirectUrl = this.isDefaultHosting() ? defaultHostingUrl : customDomainUrl;

    return redirectUrl;
  },

  isDefaultHosting() {
    const { hostingDetails } = this.state;

    if (hostingDetails) {
      return _.includes(hostingDetails.domains, 'default');
    }

    return false;
  },

  handleUploadFiles(event) {
    event.stopPropagation();
    const { files } = event.target;

    if (files && files.length) {
      const filesToUpload = _.map(files, this.extendFilePath);

      this.setState({ filesToUpload });
    }
  },

  handleClearFiles() {
    this.setState({
      filesToUpload: []
    });
  },

  handleShowPublishDialog() {
    const { hostingId, instanceName } = this.props.params;

    HostingPublishDialogActions.showDialog({ id: hostingId, instanceName });
  },

  handleSendFiles() {
    const { filesToUpload } = this.state;
    const { hostingId } = this.props.params;

    HostingFilesActions.uploadFiles(hostingId, filesToUpload);
  },

  extendFilePath(file) {
    const firstSlashIndex = file.webkitRelativePath.indexOf('/');

    file.path = file.webkitRelativePath.substring(firstSlashIndex + 1);

    return file;
  },

  showSnackbar() {
    const snackbar = {
      message: "You don't have any domains yet. Please add some or set Hosting as default."
    };

    this.setSnackbarNotification(snackbar);
  },

  render() {
    const {
      isLoading,
      hideDialogs,
      items,
      filesToUpload,
      lastFileIndex,
      currentFileIndex,
      isUploading
    } = this.state;

    const hasFilesToUpload = filesToUpload.length > 0;
    const redirectUrl = this.getRedirectUrl();
    const hasRedirectUrl = !_.isEmpty(redirectUrl);

    return (
      <div>
        <Helmet title="Website Hosting" />
        <HostingDialog />
        <HostingPublishDialog />

        <InnerToolbar title="Website Hosting">
          <Show if={items.length && !isLoading}>
            <RaisedButton
              label="Open in tab"
              primary={true}
              icon={<FontIcon className="synicon-open-in-new" style={{ marginTop: 4 }} />}
              onTouchTap={!hasRedirectUrl && this.showSnackbar}
              href={redirectUrl}
              target="_blank"
            />
          </Show>
        </InnerToolbar>

        <Container>
          <HostingFilesList
            isUploading={isUploading}
            lastFileIndex={lastFileIndex}
            currentFileIndex={currentFileIndex}
            handleClearFiles={this.handleClearFiles}
            filesCount={filesToUpload.length}
            handleUploadFiles={this.handleUploadFiles}
            handleSendFiles={this.handleSendFiles}
            hasFiles={hasFilesToUpload}
            isLoading={isLoading}
            items={items}
            hideDialogs={hideDialogs}
          />
        </Container>
      </div>
    );
  }
});

export default withRouter(HostingFilesView);
