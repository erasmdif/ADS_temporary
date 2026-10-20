import { useRecordFetcher } from '@lad-sapienza/scms-core/components/Record/useRecordFetcher';
import { Field, Image, RecordProvider } from '@lad-sapienza/scms-core/components/Record';
import ExampleRow from './ExampleRow';

export default function RecordView() {
  const { record, loading, error, table, id } = useRecordFetcher();

  if (loading) {
    return <div style={{ padding: '2rem', opacity: 0.5 }}>Loading record…</div>;
  }

  if (error || !record) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        Record not found for table &ldquo;{table}&rdquo; with ID &ldquo;{id}&rdquo;.
      </div>
    );
  }

  return (
    // RecordProvider makes `record` available to Field / Image via React context,
    // so you don't have to pass record={record} on every child component.
    <RecordProvider record={record}>

      <div className="container my-5">
        <ExampleRow code={`record.Site_Name || \`Record ${id}\``}>
          {record.Site_Name || `Record ${id}`}
        </ExampleRow>

        <hr />

        <ExampleRow code={`<Field name="Site_Name" fallback={\`Record ${id}\`} />`}>
          <Field name="Site_Name" fallback={`Record ${id}`} />
        </ExampleRow>

        <hr />

        <ExampleRow code={`{record.Latitude && record.Longitude && (
  <div className="font-monospace small mb-1">
    <span className="fw-semibold">Coordinates (direct):</span>{' '}
    {record.Latitude}, {record.Longitude}
  </div>
)}`}>
          {record.Latitude && record.Longitude && (
            <div className="font-monospace small mb-1">
              <span className="fw-semibold">Coordinates (direct):</span>{' '}
              {record.Latitude}, {record.Longitude}
            </div>
          )}
        </ExampleRow>

        <hr />

        <ExampleRow code={`<span className="fw-semibold">Coordinates (Field):</span>{' '}
<Field
  name="Latitude"
  transformer={lat =>
    \`\${lat}, \${record.Longitude ?? '?'}\`
  }
/></div>`}>
          <span className="fw-semibold">Coordinates (Field):</span>{' '}
                <Field
                  name="Latitude"
                  transformer={lat =>
                    `${lat}, ${record.Longitude ?? '?'}`
                  }
                />
        </ExampleRow>

        <hr />

        <ExampleRow code={`{record.Thumbnail && (
  <div className="mb-3">
    <p className="small text-muted mb-1">Thumbnail (direct):</p>
    <img
      src={record.Thumbnail}
      alt="Site thumbnail"
      className="img-fluid rounded shadow"
    />
  </div>
)}`}>
          {record.Thumbnail && (
          <div className="mb-3">
            <p className="small text-muted mb-1">Thumbnail (direct):</p>
            <img
              src={record.Thumbnail}
              alt="Site thumbnail"
              className="img-fluid rounded shadow"
            />
          </div>
        )}
        </ExampleRow>

        <hr />

        <ExampleRow code={`<p className="small text-muted mb-1">Thumbnail (Image component, plain URL):</p>
<Image
  fieldName="Thumbnail"
  className="img-fluid rounded shadow"
  alt="Site thumbnail"
/>`}>
          <p className="small text-muted mb-1">Thumbnail (Image component, plain URL):</p>
          <Image
            fieldName="Thumbnail"
            className="img-fluid rounded shadow"
            alt="Site thumbnail"
          />
        </ExampleRow>

        <hr />

        <ExampleRow code={`<Image
  fieldName="Thumbnail"
  index={0}
  className="img-fluid rounded shadow me-2"
  alt="Site image"
/>`}
>       <Image
            fieldName="Thumbnail"
            index={0}
            className="img-fluid rounded shadow me-2"
            alt="Site image"
          />
       </ExampleRow>

        <hr />

        <ExampleRow code={`<Image
  fieldName="Thumbnail"
  index="all"
  className="img-fluid rounded shadow me-2"
  alt="Site image"
/>`}
>       <Image
            fieldName="Thumbnail"
            index="all"
            className="img-fluid rounded shadow me-2"
            alt="Site image"
          />
       </ExampleRow>
      </div>


            <div className="container my-5">
        <div className="row g-4">
          <div className="col-12">
            <h1 className="display-4 fw-bold mb-3">
              {/* --- direct access --- */}
              {record.Site_Name || `Record ${id}`}
            </h1>
            <p className="text-muted mb-4">
              Table: {table} | ID: {id}
            </p>
          </div>

          {/* Description Column */}
          <div className="col-md-6">
            <h2 className="h4 fw-semibold mb-2">Description</h2>

            <p className="lead">
              {record.Description || 'No description available'}
            </p>

            <div className="mt-4">
              <h3 className="h6 fw-medium mb-2">Additional Info</h3>

              {/* direct access */}
              <p className="small text-muted mb-1">
                Survey Year: {record.Survey_Year || 'N/A'}
              </p>

              {/* direct access */}
              <p className="small text-muted">
                Creator: {record.Creator || 'N/A'}
              </p>
            </div>
          </div>

          {/* Location Column */}
          <div className="col-md-6">
            <h2 className="h4 fw-semibold mb-2">Location</h2>
            <div className="mb-2">
              {record.Latitude && record.Longitude && (
                <div className="font-monospace small mb-1">
                  <span className="fw-semibold">Coordinates (direct):</span>{' '}
                  {record.Latitude}, {record.Longitude}
                </div>
              )}

              <div className="small text-muted mb-1">
                <span className="fw-semibold">Context:</span> {record.Context_3 || 'N/A'}
              </div>
              <div className="small text-muted">
                <span className="fw-semibold">Setting:</span> {record.Setting || 'N/A'}
              </div>
            </div>

            {/* Image component examples */}
            <div className="mt-3">
              {/* direct access — plain URL field */}
              {record.Thumbnail && (
                <div className="mb-3">
                  <p className="small text-muted mb-1">Thumbnail (direct):</p>
                  <img
                    src={record.Thumbnail}
                    alt="Site thumbnail"
                    className="img-fluid rounded shadow"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional sections */}
          <div className="col-12 mt-4">
            <h2 className="h4 fw-semibold mb-3">Site Details</h2>
            <div className="row text-muted small">
              <div className="col-md-4 mb-2">
                {/* direct access */}
                <span className="fw-semibold">Item Category:</span> {record.Item_Category || 'N/A'}
              </div>
              <div className="col-md-4 mb-2">
                {/* Field component — dot-path syntax works for nested fields too,
                    e.g. name="category.name" would read record.category.name   */}
                <span className="fw-semibold">Item Category (Field):</span>{' '}
                <Field name="Item_Category" fallback="N/A" />
              </div>
              <div className="col-md-4 mb-2">
                <span className="fw-semibold">Site Number:</span> {record.Site_Number || 'N/A'}
              </div>
              <div className="col-md-4 mb-2">
                <span className="fw-semibold">Survey Date:</span> {record.Survey_Date || 'N/A'}
              </div>
            </div>
            {record.Site_Description && (
              <div className="mt-3">
                <h3 className="fw-semibold mb-2">Site Description</h3>
                <p className="text-body text-small">
                  {record.Site_Description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RecordProvider>
  );
}
