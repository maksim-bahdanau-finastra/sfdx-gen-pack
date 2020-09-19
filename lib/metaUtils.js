
var xmlBuilder = require('xmlbuilder');
var fs = require('fs-extra');
var mkdirp = require('mkdirp');

/**
 * Mapping of file name to Metadata Definition
 */
//@todo -- finish out all the different metadata types
var metaMap = {
	'applications': 'CustomApplication',
	'appMenus': 'AppMenu',
	'approvalProcesses': 'ApprovalProcess',
	'assignmentRules': 'AssignmentRules',
	'aura': 'AuraDefinitionBundle',
	'authproviders': 'AuthProvider',
	'autoResponseRules': 'AutoResponseRules',
	'classes': 'ApexClass',
	'communities': 'Community',
	'components': 'ApexComponent',
	'connectedApps': 'ConnectedApp',
	'contentassets': 'ContentAsset',
	'customPermissions': 'CustomPermission',
	'customMetadata': 'CustomMetadata',
	'dashboards': 'Dashboard',
	'documents': 'Document',
	'duplicateRules': 'DuplicateRule',
	'email': 'EmailTemplate',
	'escalationRules': 'EscalationRules',
	'flexipages': 'FlexiPage',
	'flowDefinitions': 'FlowDefinition',
	'flows': 'Flow',
	'globalValueSets': 'GlobalValueSet',
	'groups': 'Group',
	'homePageComponents': 'HomePageComponent',
	'homePageLayouts': 'HomePageLayout',
	'installedPackages': 'InstalledPackage',
	'labels': 'CustomLabels',
	'layouts': 'Layout',
	'letterhead': 'Letterhead',
	'lwc': 'LightningComponentBundle',
	'managedTopics': 'ManagedTopics',
	'matchingRules': 'MatchingRule',
	'namedCredentials': 'NamedCredential',
	'networks': 'Network',
	'objects': 'CustomObject',
	'objectTranslations': 'CustomObjectTranslation',
	'pages': 'ApexPage',
	'pathAssistants': 'PathAssistant',
	'permissionsets': 'PermissionSet',
	'permissionsetgroups': 'PermissionSetGroup',
	'portals':'Portal',
	'profiles': 'Profile',
	'queues': 'Queue',
	'quickActions': 'QuickAction',
	'remoteSiteSettings': 'RemoteSiteSetting',
	'reports': 'Report',
	'reportTypes': 'ReportType',
	'roles': 'Role',
	'settings': 'Settings',
	'sharingRules': 'SharingRules',
	'sharingSets': 'SharingSet',
	'siteDotComSites': 'SiteDotCom',
	'sites': 'CustomSite',
	'standardValueSets': 'StandardValueSet',
	'staticresources': 'StaticResource',
	'triggers': 'ApexTrigger',
	'tabs': 'CustomTab',
	'workflows': 'Workflow',
	'weblinks': 'CustomPageWebLink',
	'accountSettings': 'Settings',
	'campaignSettings': 'Settings',
	'caseSettings': 'Settings',
	'communitiesSettings': 'Settings',
	'currencySettings': 'Settings',
	'leadConvertSettings': 'Settings',
	'opportunitySettings': 'Settings',
	'orderSettings': 'Settings',
	'surveySettings': 'Settings'
};

exports.packageWriter = function(metadata, apiVersion) {

	apiVersion = apiVersion || '49.0';
	var xml = xmlBuilder.create('Package', { version: '1.0', encoding:'UTF-8', standalone:'yes'});
		xml.att('xmlns', 'http://soap.sforce.com/2006/04/metadata');

	for (var type in metadata) {

		if (metadata.hasOwnProperty(type)) {

			var typeXml = xml.ele('types');


			metadata[type].forEach(function(item) {
				typeXml.ele('members', item);
			});

			typeXml.ele('name', metaMap[type]);
		}

	}
	xml.ele('version', apiVersion);

	return xml.end({pretty: true});
};

exports.buildPackageDir = function (dirName, name, metadata, packgeXML, destructive, cb) {

	var packageDir;
	var packageFileName;
	if (destructive) {
		packageDir = dirName +'/destructive';
		packageFileName = '/destructiveChanges.xml';
	} else {
		packageDir = dirName + '/unpackaged';
		packageFileName = '/package.xml';
	}

	//@todo -- should probably validate this a bit
	mkdirp(packageDir, (err) => {

		if(err) {
			return cb('Failed to write package directory ' + packageDir);
		}

		// Writefile to copy folder
		// fs.writeFile(packageDir + packageFileName, packgeXML, 'utf8', (err) => {
		// 	if(err) {
		// 		return cb('Failed to write xml file');
		// 	}

		// 	return cb(null, packageDir);
		// });

		fs.writeFile(dirName + '/' + packageFileName, packgeXML, 'utf8', (err) => {
			if(err) {
				return cb('Failed to write xml file');
			}

			return cb(null, packageDir);
		});
	});

};

exports.copyFiles = function(sourceDir, buildDir, files) {

        sourceDir = sourceDir + '/';
	buildDir = buildDir + '/';
	var metaSuffix = '-meta.xml';

    files.forEach(function(file) {

        if(file) {
		fs.copySync(sourceDir + file, buildDir + file);
		var pairedFile = '';
		// check if the paired file exists
                if(file.endsWith(metaSuffix)) {
                	pairedFile = file.replace(metaSuffix, '');
            	}
            	else {
			pairedFile = file + metaSuffix;
		}
            	var pairExists = true;
		try {
			fs.accessSync(sourceDir + pairedFile, fs.F_OK);
		}
		catch (err) {
			console.log('does not exist');
			pairExists = false;
		}

		if(pairExists) {
			fs.copySync(sourceDir + pairedFile, buildDir + pairedFile);
		}
        }

    });

};
